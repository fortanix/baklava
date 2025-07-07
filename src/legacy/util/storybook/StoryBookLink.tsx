import * as React from 'react';

import './StoryBookLink.scss';

export const DummyLink = (props: React.ComponentProps<'a'>) =>
  <a className="bkl-dummy-link" href="/" onClick={event => { event.preventDefault(); }} {...props}/>;
