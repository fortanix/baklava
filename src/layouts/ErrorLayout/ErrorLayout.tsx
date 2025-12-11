/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import * as React from 'react';

import { Icon, IconName } from '../../components/graphics/Icon/Icon.tsx';
import { Link } from '../../components/actions/Link/Link.tsx';
import { H2 } from '../../typography/Heading/Heading.tsx';

import cl from './ErrorLayout.module.scss';


const ErrorLayoutActions = (props: React.ComponentProps<'div'>) => (
  <div {...props} className={cl['bk-error-layout__content__actions']}>{props.children}</div>
);

export type ErorrLayoutProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Whether this component should be unstyled. Default: false. */
  unstyled?: undefined | boolean,

  /** Whether the error container should be displayed as a flat panel (no shadows/borders/rounding). Default: false. */
  flat?: undefined | boolean,

  /** The error icon */
  icon: IconName,

  /** The title of the error, to be displayed in the under the icon. */
  title: string,

  /** The error description, to be displayed in the under the title. */
  description?: string

  /** Optional redirection link for the displayed error */
  redirectTo?: string | undefined,

  /** Optional redirection link label for the error */
  redirectLinkLabel?: string | undefined,
};
/**
 * The error component displays an interaction with the user, for example a confirmation, or a form to be submitted.
 */
export const ErrorLayout = Object.assign(
  (props: ErorrLayoutProps) => {
    const {
      unstyled = false,
      flat = false,
      icon,
      title,
      description,
      redirectTo,
      redirectLinkLabel,
      children,
      ...propsRest
    } = props;

    return (
      <div
        {...propsRest}
        className={cx(
          'bk',
          {[cl['bk-error-layout']]: !unstyled},
        )}
      >
        <div className={cl['bk-error-layout__content']}>
          <Icon className={cl['bk-error-icon']} icon={icon}/>
          <H2 className={cl['bk-error-title']}>{title}</H2>
          {description &&
            <div className={cl['bk-error-description']}>
              {description}
              {redirectTo && <Link href={redirectTo} label={redirectLinkLabel} onClick={() => {}}/>}
            </div>
          }
          <div>{children}</div>
        </div>
      </div>
    );
  },
  {
    Actions: ErrorLayoutActions,
  },
);
