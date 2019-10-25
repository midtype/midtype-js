import React from 'react';
import styled from 'styled-components';

import * as colors from '../../constants/colors';

interface IProps {
  className?: string;
  status?: string;
  secondary?: boolean;
  onClick?: (e: any) => void;
  style?: React.CSSProperties;
  loading?: boolean;
}

const Styled = styled.button`
  border: 0;
  box-shadow: none;
  outline: none;
  background: none;
  padding: 10px 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 5px;
  transition: 250ms all ease-in-out;
  transform: translateZ(0);
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;

  background-color: ${(props: IProps) =>
    props.secondary ? colors.WHITE() : colors.BRAND_1()};
  border: none;
  color: ${(props: IProps) =>
    props.secondary ? colors.BRAND_1() : colors.WHITE()};

  &:hover {
    transform: translateY(-2px);
  }

  &.button--loading label {
    opacity: 0;
  }

  &.button--loading .button__loading {
    display: initial;
  }

  .button__loading {
    display: none;
    position: absolute;
    left: calc(50% - 8px);
    top: calc(50% - 8px);
    border: 2px solid ${colors.WHITE(0.4)};
    border-top-color: ${colors.WHITE(0.1)};
    border-radius: 100%;
    height: 16px;
    width: 16px;
    animation: rotate 0.8s infinite linear;
    border-color: ${(props: IProps) => {
      if (props.status === 'error' && props.secondary) {
        return colors.RED(0.6);
      } else if (props.secondary) {
        return colors.BRAND_1(0.6);
      }
      return colors.WHITE(0.4);
    }};
    border-top-color: ${(props: IProps) => {
      if (props.status === 'error') {
        return colors.RED(0.9);
      } else if (props.secondary) {
        return colors.BRAND_1(0.9);
      }
      return colors.WHITE(0.2);
    }};
  }

  h4 {
    color: ${(props: IProps) => (props.secondary ? 'black' : 'white')};
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;

const Button: React.FC<IProps> = props => (
  <Styled
    status={props.status}
    secondary={props.secondary}
    onClick={props.onClick}
    style={props.style}
    className={`${props.className || ''} ${
      props.loading ? ' button--loading' : ''
    }`}
  >
    <div className="button__loading" />
    <label>{props.children}</label>
  </Styled>
);

export default Button;
