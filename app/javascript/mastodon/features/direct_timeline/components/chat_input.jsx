import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';

import { IconButton } from 'mastodon/components/icon_button';

const messages = defineMessages({
  placeholder: { id: 'chat.input.placeholder', defaultMessage: 'Write a message...' },
  send: { id: 'chat.input.send', defaultMessage: 'Send' },
});

class ChatInput extends PureComponent {

  static propTypes = {
    conversation: ImmutablePropTypes.map,
    onSend: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  state = {
    value: '',
  };

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const { value } = this.state;
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return;
    }

    this.props.onSend(trimmed);
    this.setState({ value: '' });
  };

  render() {
    const { disabled, intl } = this.props;
    const { value } = this.state;

    return (
      <div className='chat-input'>
        <div className='chat-input__wrapper'>
          <textarea
            className='chat-input__textarea'
            placeholder={intl.formatMessage(messages.placeholder)}
            value={value}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          <IconButton
            className='chat-input__send'
            title={intl.formatMessage(messages.send)}
            icon='paper-plane'
            onClick={this.handleSubmit}
            disabled={disabled || value.trim().length === 0}
          />
        </div>
      </div>
    );
  }

}

export default injectIntl(ChatInput);
