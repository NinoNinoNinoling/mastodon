import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { Avatar } from 'mastodon/components/avatar';
import AttachmentList from 'mastodon/components/attachment_list';
import { RelativeTimestamp } from 'mastodon/components/relative_timestamp';
import StatusContent from 'mastodon/components/status_content';

class ChatMessage extends ImmutablePureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    isOwn: PropTypes.bool.isRequired,
    showAvatar: PropTypes.bool,
  };

  static defaultProps = {
    showAvatar: true,
  };

  render() {
    const { status, isOwn, showAvatar } = this.props;
    const account = status.get('account');

    return (
      <div className={classNames('chat-message', { 'chat-message--own': isOwn })}>
        {!isOwn && showAvatar && (
          <div className='chat-message__avatar'>
            <Avatar account={account} size={32} />
          </div>
        )}

        <div className='chat-message__bubble'>
          {!isOwn && (
            <div className='chat-message__author'>
              <bdi>
                <strong
                  className='display-name__html'
                  dangerouslySetInnerHTML={{ __html: account.get('display_name_html') }}
                />
              </bdi>
            </div>
          )}

          <div className='chat-message__content'>
            <StatusContent
              status={status}
              expanded={!status.get('hidden')}
              collapsible={false}
            />

            {status.get('media_attachments').size > 0 && (
              <AttachmentList
                compact
                media={status.get('media_attachments')}
              />
            )}
          </div>

          <div className='chat-message__timestamp'>
            <RelativeTimestamp timestamp={status.get('created_at')} />
          </div>
        </div>
      </div>
    );
  }

}

export default ChatMessage;
