/*
Copyright 2015 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { NavLink } from 'react-router-dom';
import { sortBy } from 'lodash';
import { isMatch } from 'app/lib/objectUtils';
import { TablePaged, Column, Cell, TextCell, SortHeaderCell, SortTypes, EmptyIndicator } from 'shared/components/DataTable';
import cfg from 'app/config';
import history from 'app/services/history';

const EmptyValue = ({ text='Empty' }) => (
  <small>
    <span>{text}</span>
  </small>
);

const TagCell = ({rowIndex, data, ...props}) => {
  const { tags } = data[rowIndex];
  let $content = tags.map((item, index) => (
    <span key={index} title={`${item.name}:${item.value}`} className="label label-default grv-nodes-table-label">
      {item.name} <li className="fa fa-long-arrow-right m-r-xs"/>
      {item.value}
    </span>
  ));

  if ($content.length === 0) {
    $content = <EmptyValue text="No assigned labels"/>
  }

  return (
    <Cell {...props}>
      {$content}
    </Cell>
  )
}

class LoginCell extends React.Component {
  onKeyPress = e => {
    if (e.key === 'Enter' && e.target.value) {
      const url = this.makeUrl(e.target.value);
      history.push(url);
    }
  }

  onShowLoginsClick = () => {
    this.refs.customLogin.focus()
  }

  makeUrl(login) {
    const { data, rowIndex } = this.props;
    const { siteId, id } = data[rowIndex];
    return cfg.getTerminalLoginUrl({
      siteId: siteId,
      serverId: id,
      login
    })
  }

  render() {
    const { logins, ...props } = this.props;
    const $lis = [];
    const defaultLogin = logins[0] || '';
    const defaultTermUrl = this.makeUrl(defaultLogin);

    for (var i = 0; i < logins.length; i++) {
      const termUrl = this.makeUrl(logins[i]);
      $lis.push(
        <li key={i}>
          <NavLink to={termUrl}>
            {logins[i]}
          </NavLink>
        </li>
      );
    }

    return (
      <Cell {...props}>
        <div style={{ display: "flex" }}>
          {logins.length === 0 &&
            <EmptyValue text="No assigned logins"/>
          }
          {logins.length > 0 &&
            <div style={{ display: "flex" }} className="btn-group">
              <NavLink to={defaultTermUrl}>
                {defaultLogin}
              </NavLink>
              <button data-toggle="dropdown"
                onClick={this.onShowLoginsClick}
                className="btn btn-default btn-xs dropdown-toggle">
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu pull-right">
                <li>
                  <div className="input-group-sm grv-nodes-custom-login">
                    <input className="form-control" ref="customLogin"
                      placeholder="Enter login name..."
                      onKeyPress={this.onKeyPress}
                    />
                  </div>
                </li>
                {$lis}
              </ul>
            </div>
          }
        </div>
      </Cell>
    )
  }
}

class NodeList extends React.Component {
  storageKey = 'NodeList';
  searchableProps = ['addr', 'hostname', 'tags'];

  constructor(props) {
    super(props);
    if (props.storage) {
      this.state = props.storage.findByKey(this.storageKey);
    }

    if (!this.state) {
      this.state = { colSortDirs: { hostname: SortTypes.DESC } };
    }
  }

  componentWillUnmount() {
    if (this.props.storage) {
      this.props.storage.save(this.storageKey, this.state);
    }
  }

  onSortChange = (columnKey, sortDir) => {
    this.state.colSortDirs = { [columnKey]: sortDir };
    this.setState(this.state);
  }

  onSshInputEnter = (login, host) => {
    const url = cfg.getTerminalLoginUrl({
      siteId: this.props.siteId,
      serverId: host,
      login
    })

    history.push(url);
  }

  searchAndFilterCb(targetValue, searchValue, propName){
    if(propName === 'tags'){
      return targetValue.some((item) => {
        const { name, value } = item;
        return name.toLocaleUpperCase().indexOf(searchValue) !==-1 ||
          value.toLocaleUpperCase().indexOf(searchValue) !==-1;
      });
    }
  }

  sortAndFilter(data, searchValue) {
    const { colSortDirs } = this.state;
    const filtered = data
      .filter(obj => isMatch(obj, searchValue, {
        searchableProps: this.searchableProps,
        cb: this.searchAndFilterCb
      }));

    const columnKey = Object.getOwnPropertyNames(colSortDirs)[0];
    const sortDir = colSortDirs[columnKey];
    let sorted = sortBy(filtered, columnKey);
    if(sortDir === SortTypes.ASC){
      sorted = sorted.reverse();
    }

    return sorted;
  }

  renderEmptyIndicator(searchValue) {
    return (
      <EmptyIndicator title={`No Results Found for "${searchValue}"`}>
        For tips on getting better search results, please read <a href="https://gravitational.com/teleport/docs">our documentation</a>
      </EmptyIndicator>
    );
  }

  render() {
    const { nodeRecords, logins, onLoginClick, searchValue } = this.props;
    const data = this.sortAndFilter(nodeRecords, searchValue);

    // no results found
    if(data.length === 0 && searchValue.length > 0) {
      return this.renderEmptyIndicator(searchValue);
    }

    return (
      <TablePaged rowCount={data.length} data={data} pageSize={50}>
        <Column
          columnKey="hostname"
          header={
            <SortHeaderCell
              sortDir={this.state.colSortDirs.hostname}
              onSortChange={this.onSortChange}
              title="Hostname"
            />
          }
          cell={<TextCell/> }
        />
        <Column
          columnKey="addr"
          header={
            <SortHeaderCell
              sortDir={this.state.colSortDirs.addr}
              onSortChange={this.onSortChange}
              title="Address"
            />
          }
          cell={<TextCell/> }
        />
        <Column
          header={<Cell>Labels</Cell> }
          cell={<TagCell/> }
        />
        <Column
          onLoginClick={onLoginClick}
          header={<Cell>Login as</Cell> }
          cell={<LoginCell logins={logins}/> }
        />
      </TablePaged>
    )
  }
}

export default NodeList;
