<mailer>
  <div class="columns height100per">
    <div class="column col-3 col-xs-3 overflow-auto" id="target">
      <mailer-nav></mailer-nav>
    </div>
    <!--<div class="column col-9 col-xs-9" if={ view.showMailBox }>-->
    <div class="column col-9 col-xs-9">
      <mailer-box></mailer-box>
    </div>
  </div>
  <script>
    function diffListMailboxes(curListMailboxes) {
      const oldListMailboxes = state.get('listMailboxes');
      const newListMailboxes = {};
      _.forEach(curListMailboxes, (mailbox, i) => {
        if (!oldListMailboxes[mailbox.uuid]) {
          // oldがなければnewに突っ込む
          newListMailboxes[mailbox.uuid] = mailbox;
        } else {
          // oldがあれば比較
          if (oldListMailboxes[mailbox.uuid].unreadCount !== mailbox.unreadCount) {
            // 未読数に差がある
            newListMailboxes[mailbox.uuid] = mailbox;
          }
        }
      });
      return newListMailboxes;
    }

    async function setViewDb() {
      const mailboxes = await db.all('mailboxes');
      const hashMailboxes = _.mapKeys(mailboxes, (mailbox) => {
        return mailbox.uuid;
      });
      // const mearge = diffListMailboxes(hashMailboxes);
      state.set('listMailboxes', hashMailboxes);
    }


    search() {
      (async function() {
        const mailbox = state.get('mailbox.target');
        const listMails = await gmail.search(mailbox.path, {
          unseen: true
        });
      }).call();
    }

    const toast = (msg) => {
      const toastNewMail = {
        subject: msg.title || '件名なし',
        show: true,
      };
      view.sets({
        toastNewMail
      });
      let timer = setTimeout(() => {
        view.sets({
          toastNewMail: {
            subject: null,
            show: false
          }
        });
        timer = null;
      }, 5000);
    };

    const observer = (name) => {
      (async function() {
        const auth = storage.get('gmail');
        gmailler.observer('observer.inbox', {
          auth
        }, (message) => {
          console.log(message);
        });
      }).call();
    }

    this.on('mount', function() {
      observer('obs.INBOX');
      $$('body').classList.remove('start_page', 'empty', 'init-loading');
      communicator.send('window:resize:start', {
        width: 800,
        height: 600,
        resizable: true,
      });
    });
  </script>
</mailer>