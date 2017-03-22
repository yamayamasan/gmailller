<mailer-box>
  <div class="panel height100per" if={ view.showMailBox }>
    <div class="panel-header text-center">
      <div class="panel-title mt-10">{ view.mailboxLabel }
        <i class="icon icon-markunread"></i>
      </div>
    </div>
    <!--<nav class="panel-nav">
      <ul class="tab tab-block">
        <li class="tab-item" each={tab, i in view.tabs}>
          <a href="#panels" onclick={ toggleTab.bind(this, i) }>{ i }</a>
        </li>
      </ul>
    </nav>-->
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
    </div>
  </div>
  <!--<div class="toast toast-primary toastNewMail" if={ view.toastNewMail.show }>
    <button class="btn btn-clear float-right"></button>
    <i class="icon icon-markunread"></i> {view.toastNewMail.subject}
  </div>-->

  <script>
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
    });

    toggleMail(uid, e) {
      if (!mailContents[uid]) {
        const params = {
          uid
        };
        gmailler.getMessage('main', params, (mail) => {
          const id = `mail-content___${uid}`;
          const div = document.createElement('div');
          div.setAttribute('id', id);
          $$(`.mail-contents__${uid}`).appendChild(div);

          params.mail = mail;
          mailContents[uid] = riot.mount(`#${id}`, 'mail-content', params);
          gmailler.readMail('main', params, (res) => {
            console.log(res);
          });
        });
      } else {
        mailContents[uid][0].unmount(false);
        mailContents[uid] = null;
      }
    }

    moreMailBox() {
      (async function() {
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
      }).call();
    }

    gmailler.onGetMailbox((listMails) => {
      console.log(listMails);
      view.sets({
        showMailBox: true,
        listMails
      });
    });
  </script>
</mailer-box>