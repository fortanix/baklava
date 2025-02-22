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
import { IconButton } from '../../actions/IconButton/IconButton.tsx';


export { cl as BannerClassNames };

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

type BannerVariantIconProps = Omit<IconProps, 'icon'> & {
  icon?: IconProps['icon'], // Make optional
  variant: BannerVariant,
};
const BannerVariantIcon = ({ variant, ...propsRest }: BannerVariantIconProps) => {
  const icon = ((): IconName => {
    switch (variant) {
      case 'info': return 'info-filled';
      case 'warning': return 'warning-filled';
      case 'error': return 'status-failed-filled';
      case 'success': return 'status-success-filled';
      default: return assertUnreachable(variant);
    }
  })();
  return <Icon icon={icon} {...propsRest}/>;
};


type ActionButtonProps = ComponentProps<typeof Button>;
/**
 * A customized version of the `<Button/>` component specifically meant to be used for banner actions.
 */
const ActionButton = (props: ActionButtonProps) => {
  return (
    <Button trimmed
      {...props}
      className={cx(cl['bk-banner__action'], cl['bk-banner__action--button'], props.className)}
      // Prevent clicks from triggering any click handlers on the Banner itself (e.g. to prevent toast dismissal)
      onClick={event => { event.stopPropagation(); props.onClick?.(event); }}
    />
  );
};

type ActionIconProps = ComponentProps<typeof IconButton> & {
  /** Optional custom tooltip text, if different from `label`. */
  tooltip?: undefined | ComponentProps<typeof TooltipProvider>['tooltip'],
};
/**
 * An action that is rendered as just an icon.
 */
const ActionIcon = ({ tooltip, ...buttonProps }: ActionIconProps) => {
  return (
    <TooltipProvider compact tooltip={typeof tooltip !== 'undefined' ? tooltip : buttonProps.label}>
      <IconButton
        {...buttonProps}
        className={cx(cl['bk-banner__action'], cl['bk-banner__action--icon'], buttonProps.className)}
        // Prevent clicks from triggering any click handlers on the Banner itself (e.g. to prevent toast dismissal)
        onClick={event => { event.stopPropagation(); buttonProps.onClick?.(event); }}
      />
    </TooltipProvider>
  );
};


export type BannerProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether to trim this component (strip any spacing around the element). */
  trimmed?: undefined | boolean,
  
  /** Whether to attempt to display the banner as a single line. */
  compact?: undefined | boolean,
  
  /** Which variant to display, which changes the color and left icon. Defaults to "info". */
  variant?: undefined | BannerVariant,
  
  /** The title of the banner. Optional. */
  title?: undefined | React.ReactNode,
  
  /** If specified, a close action is displayed. Default: false. */
  showCloseAction?: undefined | boolean,
  
  /** Callback that is called when the user requests the banner to close. */
  onClose?: undefined | (() => void),
  
  /** Any additional actions to be shown in the banner. */
  actions?: undefined | React.ReactNode,
};
/**
 * An inline banner that displays a message to the user, usually of a time-sensitive nature.
 */
export const Banner = Object.assign(
  (props: BannerProps) => {
    const {
      unstyled = false,
      trimmed = false,
      compact = true,
      variant = 'info',
      title = '',
      showCloseAction = false,
      onClose,
      actions = null,
      children,
      ...propsRest
    } = props;
    
    if (showCloseAction && typeof onClose !== 'function') {
      console.error(`Missing prop in <Banner/>: 'onClose' function`);
    }
    
    const renderTitle = () => {
      if (title) { return title; }
      
      switch (variant) {
        case 'info': return 'Info';
        case 'warning': return 'Warning';
        case 'error': return 'Error';
        case 'success': return 'Success';
        default: return assertUnreachable(variant);
      }
    };
    
    return (
      <div
        // Note: `role=alert` implies the banner is time-sensitive. If the banner is not time-sensitive, this may need
        // to be overridden with a more appropriate role (depends on use case).
        role="alert"
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-banner']]: !unstyled },
          { [cl['bk-banner--trimmed']]: trimmed },
          { [cl[`bk-banner--${variant}`]]: variant },
          propsRest.className,
        )}
      >
        {/* Apply `bk-theme--light` on all children (but not the box itself). */}
        <div className={cx('bk-theme--light', cl['bk-banner__header'])}>
          <div className={cx(cl['bk-banner__header__text'])}>
            <strong className={cx(cl['bk-banner__title'])}>
              <BannerVariantIcon variant={variant} className={cx(cl['bk-banner__title__icon'])}/>
              <span className={cx(cl['bk-banner__title__text'])}>{renderTitle()}</span>
            </strong>
            {compact && children &&
              <div className={cx('bk-prose', cl['bk-banner__message--compact'])}>{children}</div>
            }
          </div>
          
          <div className={cx(cl['bk-banner__actions'])}>
            {actions}
            
            {showCloseAction &&
              <ActionIcon
                icon="cross"
                label="Close banner"
                tooltip={null}
                className={cx(cl['bk-banner__action-close'])}
                onPress={onClose}
              />
            }
          </div>
        </div>
        
        {!compact && children &&
          <article className={cx('bk-prose', 'bk-theme--light', cl['bk-banner__message'])}>{children}</article>
        }
      </div>
    );
  },
  {
    ActionButton,
    ActionIcon,
  },
);
