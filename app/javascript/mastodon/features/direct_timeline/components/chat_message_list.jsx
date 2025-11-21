import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { List as ImmutableList } from 'immutable';

import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import ScrollableList from 'mastodon/components/scrollable_list';

import ChatMessage from './chat_message';

export default class ChatMessageList extends ImmutablePureComponent {

  static propTypes = {
    statusIds: ImmutablePropTypes.list.isRequired,
    statuses: ImmutablePropTypes.map.isRequired,
    currentAccountId: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    onLoadMore: PropTypes.func,
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.statusIds.size !== this.props.statusIds.size) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }
  };

  setMessagesEndRef = (el) => {
    this.messagesEnd = el;
  };

  render() {
    const { statusIds, statuses, currentAccountId, isLoading } = this.props;

    if (isLoading && statusIds.isEmpty()) {
      return <LoadingIndicator />;
    }

    if (statusIds.isEmpty()) {
      return (
        <div className='chat-message-list__empty'>
          <p>No messages yet. Start the conversation!</p>
        </div>
      );
    }

    let lastAccountId = null;

    return (
      <div className='chat-message-list'>
        <div className='chat-message-list__scroll'>
          {statusIds.map((statusId, index) => {
            const status = statuses.get(statusId);
            if (!status) return null;

            const accountId = status.getIn(['account', 'id']);
            const isOwn = accountId === currentAccountId;
            const showAvatar = accountId !== lastAccountId;
            lastAccountId = accountId;

            return (
              <ChatMessage
                key={statusId}
                status={status}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          })}
          <div ref={this.setMessagesEndRef} />
        </div>
      </div>
    );
  }

}
