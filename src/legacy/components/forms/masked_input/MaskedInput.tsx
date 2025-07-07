
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import { SpriteIcon as Icon } from '../../icons/Icon';

import { Tooltip } from '../../overlays/tooltip/Tooltip';
import { Button } from '../../buttons/Button';
import { Input } from '../input/Input';

import './MaskedInput.scss';


const EyeIcon = import('../../../assets/icons/eye.svg?sprite');
const EyeClosedIcon = import('../../../assets/icons/eye-closed.svg?sprite');


type MaskedInputPropsType = ComponentPropsWithoutRef<typeof Input>;
export const MaskedInput = (props: MaskedInputPropsType) => {
  const [secretVisible, setSecretVisible] = React.useState(false);
  
  return (
    <div className="bkl-masked-input">
      <Tooltip content={secretVisible ? 'Hide input' : 'Show input'}>
        <Button
          plain
          className="bkl-masked-input__visibility-button"
          onClick={() => { setSecretVisible(!secretVisible); }}
          aria-label="Toggle input visibility"
        >
          <Icon
            name={secretVisible ? 'eye' : 'eye-closed'}
            icon={secretVisible ? EyeIcon : EyeClosedIcon}
            className="bkl-masked-input__visibility-icon"
          />
        </Button>
      </Tooltip>
      <Input
        autoComplete="new-password"
        {...props}
        type={secretVisible ? 'text' : 'password'}
        className={cx('bkl-masked-input__input', props.className)}
      />
    </div>
  );
};
