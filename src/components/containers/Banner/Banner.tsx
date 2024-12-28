/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertUnreachable } from '../../../util/types.ts';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { type IconName, type IconProps, Icon } from '../../graphics/Icon/Icon.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { TooltipProvider } from '../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './Banner.module.scss';


export { cl as BannerClassNames };

type BannerVariant = 'info' | 'warning' | 'error' | 'success';

type BannerVariantIconProps = Omit<IconProps, 'icon'> & {
  icon?: IconProps['icon'], // Make optional
  variant: BannerVariant,
};
const BannerVariantIcon = ({ variant, ...propsRest }: BannerVariantIconProps) => {
  const icon = ((): IconName => {
    switch (variant) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'status-failed';
      case 'success': return 'status-success';
      default: return assertUnreachable(variant);
    }
  })();
  return <Icon icon={icon} {...propsRest}/>;
};


export type ActionButtonProps = ComponentProps<typeof Button>;
/**
 * A customized version of the `<Button/>` component specifically meant to be used for banner actions.
 */
export const ActionButton = (props: ActionButtonProps) => {
  return (
    <Button
      compact
      {...props}
      className={cx(cl['bk-banner__action'], cl['bk-banner__action--button'], props.className)}
    />
  );
};

export type ActionIconProps = ComponentProps<typeof Button> & {
  /** There must be `label` on an icon-only button, for accessibility. */
  label: Required<ComponentProps<typeof Button>>['label'],
  
  /** Optional custom tooltip text, if different from `label`. */
  tooltip?: undefined | ComponentProps<typeof TooltipProvider>['tooltip'],
};
/**
 * An action that is rendered as just an icon.
 */
export const ActionIcon = ({ tooltip, ...buttonProps }: ActionIconProps) => {
  return (
    <TooltipProvider compact tooltip={typeof tooltip !== 'undefined' ? tooltip : buttonProps.label}>
      <Button
        compact
        {...buttonProps}
        className={cx(cl['bk-banner__action'], cl['bk-banner__action--icon'], buttonProps.className)}
      />
    </TooltipProvider>
  );
};


export type BannerProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Whether the component should include the default styling. Defaults to false. */
  unstyled?: undefined | boolean,
  
  /** Which variant to display, which changes the color and left icon. Defaults to "info". */
  variant?: undefined | BannerVariant,
  
  /** The title of the banner. Required. */
  title: React.ReactNode,
  
  /** If specified, a close action is displayed. Defines the action to perform on close. */
  onClose?: undefined | (() => void),
  
  /** Any additional actions to be shown in the banner. */
  actions?: undefined | React.ReactNode,
};
/**
 * An inline banner that displays a message to the user.
 */
export const Banner = Object.assign(
  (props: BannerProps) => {
    const {
      unstyled = false,
      variant = 'info',
      title = '',
      onClose,
      actions = null,
      children,
      ...propsRest
    } = props;
    
    return (
      <div
        // Note: `role=alert` implies the banner is time-sensitive. If the banner is not time-sensitive, this may need
        // to be overridden with a more appropriate role (depends on use case).
        role="alert"
        {...propsRest}
        className={cx(
          'bk',
          'bk-theme--light',
          { [cl['bk-banner']]: !unstyled },
          { [cl[`bk-banner--${variant}`]]: variant },
          propsRest.className,
        )}
      >
        <div className={cx(cl['bk-banner__content'])}>
          <strong className={cx(cl['bk-banner__title'])}>
            <BannerVariantIcon variant={variant} className={cx(cl['bk-banner__title__icon'])}/>
            <span className={cx(cl['bk-banner__title__text'])}>{title}</span>
          </strong>
          {children &&
            <div className={cx('bk-body-text', cl['bk-banner__message'])}>{children}</div>
          }
        </div>
        
        <div className={cx(cl['bk-banner__actions'])}>
          {actions}
        </div>
        {onClose &&
          <div className={cx(cl['bk-banner__actions'])}>
            <ActionIcon
              label="Close banner"
              tooltip={null}
              className={cx(cl['bk-banner__action-close'])}
              onPress={onClose}
            >
              <Icon icon="cross"/>
            </ActionIcon>
          </div>
        }
      </div>
    );
  },
  {
    ActionButton,
    ActionIcon,
  },
);
