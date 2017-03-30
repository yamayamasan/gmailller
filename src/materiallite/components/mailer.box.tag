<mailer-box>
  <main class="mdl-layout__content margin240px">
    <div class="page-content fixedpage">
      <ul class=" mdl-list" if={ view.showMailBox }>
        <div each={mail, i in view.listMails}>
          <li class="mdl-list__item mdl-list__item--three-line box_li_{mail.UID}" onclick={ toggleMail.bind(this, mail.UID) }>
            <span class="mdl-list__item-primary-content">
            <!--<i class="material-icons mdl-list__item-avatar">person</i>-->
            <span>{ mail.from.name }</span>
            <span class="mdl-list__item-text-body">{ mail.title }</span>
            </span>
            <span class="mdl-list__item-secondary-content">
          <a class="mdl-list__item-secondary-action" href="#"><i class="material-icons">star</i></a>
          </span>
          </li>
          <div class="mail-contents__{ mail.UID }"></div>
        </div>
      </ul>
    </div>
  </main>
  <style>
    .margin240px {
      margin-left: 240px;
    }
    
    .fixedpage {
      overflow-y: scroll;
      max-height: 100%;
      position: fixed;
    }
    .mdl-shadow--2dp-nounder {
      box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
    }
  </style>
  <!--
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
        <div class="mail-contents__{ mail.UID }"></div>
        <div class="divider"></div>
      </div>
    </div>
    <div class="panel-footer">
      <button class="btn btn-primary btn-block" onclick={ moreMailBox }>More</button>
      <button class="btn btn-primary btn-block" onclick={ onlyMailBox }>Only</button>
    </div>
  </div>
  -->
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
        (async () => {
          document.querySelector(`.box_li_${uid}`).classList.add('mdl-shadow--2dp-nounder');
          const mail = await gmailler.getMailByUid('main', uid);
          console.log(e.parent)
          const id = `mail-content___${uid}`;
          const div = document.createElement('div');
          div.setAttribute('id', id);
          $$(`.mail-contents__${uid}`).appendChild(div); // タイミング

          const tag = riot.mount(`#${id}`, 'mail-content', mail);
          state.local.set(`mailContents.${uid}`, tag);
        }).call();
      }

      function closeMail(uid, e) {
        const tag = state.local.get(`mailContents.${uid}`);
        tag[0].unmount(false);
        document.querySelector(`.box_li_${uid}`).classList.remove('mdl-shadow--2dp-nounder');
        state.local.set(`mailContents.${uid}`, null);
      }

      toggleMail(uid, e) {
        const tag = state.local.get(`mailContents.${uid}`);
        if (!tag) {
          openMail(uid, e);
        } else {
          closeMail(uid, e);
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