import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { connect } from 'react-redux';

import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import { mountConversations, unmountConversations, expandConversations } from 'mastodon/actions/conversations';
import { connectDirectStream } from 'mastodon/actions/streaming';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';

import ConversationsListContainer from './containers/conversations_list_container';
import ChatView from './components/chat_view';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Private mentions' },
});

const mapStateToProps = (state) => ({
  conversations: state.get('conversations'),
});

class DirectTimeline extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    columnId: PropTypes.string,
    intl: PropTypes.object.isRequired,
    hasUnread: PropTypes.bool,
    multiColumn: PropTypes.bool,
    conversations: PropTypes.object,
  };

  state = {
    selectedConversationId: null,
  };

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('DIRECT', {}));
    }
  };

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  };

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  componentDidMount () {
    const { dispatch } = this.props;

    dispatch(mountConversations());
    dispatch(expandConversations());
    this.disconnect = dispatch(connectDirectStream());
  }

  componentWillUnmount () {
    this.props.dispatch(unmountConversations());

    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  setRef = c => {
    this.column = c;
  };

  handleLoadMore = maxId => {
    this.props.dispatch(expandConversations({ maxId }));
  };

  handleConversationSelect = (conversationId) => {
    this.setState({ selectedConversationId: conversationId });
  };

  render () {
    const { intl, hasUnread, columnId, multiColumn, conversations } = this.props;
    const { selectedConversationId } = this.state;
    const pinned = !!columnId;

    const selectedConversation = selectedConversationId
      ? conversations.getIn(['items', selectedConversationId])
      : null;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='envelope'
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        />

        <div className='direct-timeline__layout'>
          <div className='direct-timeline__conversations'>
            <ConversationsListContainer
              trackScroll={!pinned}
              scrollKey={`direct_timeline-${columnId}`}
              timelineId='direct'
              bindToDocument={!multiColumn}
              onLoadMore={this.handleLoadMore}
              onSelect={this.handleConversationSelect}
              selectedId={selectedConversationId}
              prepend={<div className='follow_requests-unlocked_explanation'><span><FormattedMessage id='compose_form.encryption_warning' defaultMessage='Posts on Mastodon are not end-to-end encrypted. Do not share any dangerous information over Mastodon.' /> <a href='/terms' target='_blank'><FormattedMessage id='compose_form.direct_message_warning_learn_more' defaultMessage='Learn more' /></a></span></div>}
              alwaysPrepend
              emptyMessage={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any private mentions yet. When you send or receive one, it will show up here." />}
            />
          </div>

          <div className='direct-timeline__chat'>
            <ChatView conversation={selectedConversation} />
          </div>
        </div>

        <Helmet>
          <title>{intl.formatMessage(messages.title)}</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(DirectTimeline));
