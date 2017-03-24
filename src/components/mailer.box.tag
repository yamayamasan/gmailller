<mailer-box>
  <div class="panel height100per" if={ view.showMailBox }>
    <div class="panel-header text-center">
      <div class="panel-title mt-10">{ view.mailboxLabel }
        <i class="icon icon-markunread"></i>
      </div>
    </div>
    <div class="panel-body">
      <div each={mail, i in view.listMails}>
        <div class="tile tile-centered mail_{ mail.UID } mailitem">
          <div class="tile-content" onclick={ toggleMail.bind(this, mail.UID) } data-uid={ mail.UID }>
            <div class="tile-meta">{ mail.from.name }</div>
            <div class="tile-meta">
              <time>{ helper.date(mail.date) }</time>
            </div>
            <div class="tile-title">{ mail.title }</div>
          </div>
          <div class="tile-action" if={ !mail.read }>
            <button class="btn btn-link btn-action btn-lg"><i class="icon icon-mail_outline"></i></button>
          </div>
        </div>
        <!-- mail contents-->
        <div class="mail-contents__{ mail.UID }"></div>
        <!-- //mail contents-->
        <div class="divider"></div>
      </div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-primary btn-block" onclick={ moreMailBox }>More</button>
      <button class="btn btn-primary btn-block" onclick={ onlyMailBox }>Only</button>
    </div>
  </div>

  <script>
    const FROM_RANGE = 50;
    helper = new Helper(this);

    const mailContents = {};
    const view = new View({
      listMails: [],
      mailboxLabel: null,
      showMailBox: false,
    }, this);

    state.initialize({
      mailbox: {
        list: [],
        from: null,
      },
      listMailboxes: {},
      mailContents: {},
    });

    function openMail(uid, e) {
      (async() => {
        const mail = await gmailler.getMailByUid('main', uid);
        const id = `mail-content___${uid}`;
        const div = document.createElement('div');
        div.setAttribute('id', id);
        $$(`.mail-contents__${uid}`).appendChild(div); // タイミング

        const tag = riot.mount(`#${id}`, 'mail-content', mail);
        state.local.set(`mailContents.${uid}`, tag);
      }).call();
    }

    function closeMail(uid) {
      const tag = state.local.get(`mailContents.${uid}`);
      tag[0].unmount(false);
      state.local.set(`mailContents.${uid}`, null);
    }

    toggleMail(uid, e) {
      const tag = state.local.get(`mailContents.${uid}`);
      if (!tag) {
        openMail(uid, e);
      } else {
        closeMail(uid);
      }
    }

    // onlyMailBox() {
    //   const mailbox = state.get('mailbox');
    //   const listMails = await gmailler.getUnreadMailboxSync('main', {
    //     listMails: [],
    //     mailbox: mailbox.target,
    //     from: -10,
    //   });
    // }

    moreMailBox() {
      const mailbox = state.get('mailbox');

      const listMails = gmailler.getMailboxSync('main', {
        listMails: view.get('listMails'),
        mailbox: mailbox.target,
        from: mailbox.from,
      });
      view.sets({
        listMails
      });
      state.set('mailbox.from', mailbox.from - 10);
    }

    // observe
    state.observe('mailboxLabel', (name) => {
      view.sets({
        mailboxLabel: name
      });
    });

    gmailler.onGetMailbox((listMails) => {
      state.set('listMails', listMails);
      view.sets({
        showMailBox: true,
        listMails
      });
    });
  </script>
</mailer-box>