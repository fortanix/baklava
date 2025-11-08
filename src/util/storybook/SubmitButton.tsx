
import * as React from 'react';
import { internalSubmitSymbol, Button } from '../../components/actions/Button/Button.tsx';


export const SubmitButton = (props: React.ComponentProps<typeof Button>) =>
  // @ts-expect-error We're using an invalid `type` on purpose here, this is meant to be used internally only.
  <Button kind="primary" {...props} type={internalSubmitSymbol}/>;
