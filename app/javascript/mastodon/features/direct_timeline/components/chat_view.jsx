import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { List as ImmutableList } from 'immutable';

import { changeCompose, changeComposeVisibility, submitCompose } from 'mastodon/actions/compose';
import { fetchStatus } from 'mastodon/actions/statuses';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';

import ChatInput from './chat_input';
import ChatMessageList from './chat_message_list';

const messages = defineMessages({
  title: { id: 'chat.title', defaultMessage: 'Conversation' },
});

const mapStateToProps = (state, { conversation }) => {
  const statusIds = conversation ? conversation.get('status_ids', ImmutableList()) : ImmutableList();

  return {
    statusIds,
    statuses: state.get('statuses'),
    currentAccountId: state.getIn(['meta', 'me']),
  };
};

class ChatView extends ImmutablePureComponent {

  static propTypes = {
    conversation: ImmutablePropTypes.map,
    statusIds: ImmutablePropTypes.list,
    statuses: ImmutablePropTypes.map,
    currentAccountId: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.loadMessages();
  }

  componentDidUpdate(prevProps) {
    if (this.props.conversation !== prevProps.conversation) {
      this.loadMessages();
    }
  }

  loadMessages = () => {
    const { conversation, dispatch, statuses } = this.props;

    if (!conversation) return;

    const statusIds = conversation.get('status_ids', ImmutableList());

    // Load any missing statuses
    statusIds.forEach(statusId => {
      if (!statuses.get(String(statusId))) {
        dispatch(fetchStatus(statusId));
      }
    });
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
    const { conversation, statusIds, statuses, currentAccountId, intl } = this.props;

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

    return (
      <div className='chat-view'>
        <div className='chat-view__header'>
          <h2 className='chat-view__title'>{participantNames}</h2>
        </div>

        <ChatMessageList
          statusIds={statusIds}
          statuses={statuses}
          currentAccountId={currentAccountId}
          isLoading={false}
        />

        <ChatInput
          conversation={conversation}
          onSend={this.handleSend}
        />
      </div>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(ChatView));
