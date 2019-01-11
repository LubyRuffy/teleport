import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components'

function MenuItem(props) {
  return (
    <StyledMenuItem
      tabIndex={-1}
      {...props}
    />
  );
}

MenuItem.propTypes = {
  /**
   * Menu item contents.
   */
  children: PropTypes.node,
  /**
   * The component used for the root node.
   * Either a string to use a DOM element or a component.
   */
  /**
   * @ignore
   */
  role: PropTypes.string,
  /**
   * @ignore
   */
  selected: PropTypes.bool,
};

MenuItem.defaultProps = {
  component: 'li',
  role: 'menuitem',
};

const StyledMenuItem = styled.div`
  background-color: ${props => props.theme.colors.bgLight};
  border-bottom: 1px solid ${props => props.theme.colors.subtle};
  box-sizing: content-box;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  line-height: 48px;
  line-height: 48px;
  overflow: hidden;
  padding: 0 32px;
  text-align: inherit;
  text-decoration: none;
  text-transform: uppercase;
  transition: all .3s;
  white-space: nowrap;
  white-space: nowrap;
  width: auto;
  &:hover,
  &:focus {
    color: ${props => props.theme.colors.link};
    text-decoration: none;
    background-color: #f8f9fa;
  }

  &:last-child {
    border: none;
  }

`
export default MenuItem;