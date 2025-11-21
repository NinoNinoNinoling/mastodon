import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { changeCompose, changeComposeVisibility, submitCompose } from 'mastodon/actions/compose';
import { fetchStatus } from 'mastodon/actions/statuses';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';

import ChatInput from './chat_input';
import ChatMessage from './chat_message';

const messages = defineMessages({
  title: { id: 'chat.title', defaultMessage: 'Conversation' },
});

const mapStateToProps = (state, { conversation }) => {
  const lastStatusId = conversation ? conversation.get('last_status') : null;
  const status = lastStatusId ? state.getIn(['statuses', lastStatusId]) : null;

  return {
    status,
    currentAccountId: state.getIn(['meta', 'me']),
  };
};

class ChatView extends ImmutablePureComponent {

  static propTypes = {
    conversation: ImmutablePropTypes.map,
    status: ImmutablePropTypes.map,
    currentAccountId: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.loadStatus();
  }

  componentDidUpdate(prevProps) {
    if (this.props.conversation !== prevProps.conversation) {
      this.loadStatus();
    }
  }

  loadStatus = () => {
    const { conversation, status, dispatch } = this.props;

    if (!conversation) return;

    const lastStatusId = conversation.get('last_status');
    if (lastStatusId && !status) {
      dispatch(fetchStatus(lastStatusId));
    }
  };

  handleSend = (text) => {
    const { conversation, dispatch } = this.props;

    if (!conversation) return;

    const participants = conversation.get('accounts');
    if (!participants || participants.isEmpty()) return;

    // Get mentions from participants
    const mentions = participants.map(account => `@${account.get('acct')}`).join(' ');
    const composedText = `${mentions} ${text}`;

    // Set compose state
    dispatch(changeCompose(composedText));
    dispatch(changeComposeVisibility('direct'));

    // Submit
    dispatch(submitCompose());
  };

  render() {
    const { conversation, status, currentAccountId } = this.props;

    if (!conversation) {
      return (
        <div className='chat-view chat-view--empty'>
          <div className='chat-view__empty-message'>
            <FormattedMessage
              id='chat.empty'
              defaultMessage='Select a conversation to start messaging'
            />
          </div>
        </div>
      );
    }

    const participants = conversation.get('accounts');
    const participantNames = participants
      ? participants.map(a => a.get('display_name') || a.get('username')).join(', ')
      : '';

    const isOwn = status && status.getIn(['account', 'id']) === currentAccountId;

    return (
      <div className='chat-view'>
        <div className='chat-view__header'>
          <h2 className='chat-view__title'>{participantNames}</h2>
        </div>

        <div className='chat-message-list'>
          <div className='chat-message-list__scroll'>
            {status ? (
              <ChatMessage
                status={status}
                isOwn={isOwn}
                showAvatar={true}
              />
            ) : (
              <LoadingIndicator />
            )}
          </div>
        </div>

        <ChatInput
          conversation={conversation}
          onSend={this.handleSend}
        />
      </div>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(ChatView));
