<mailer-nav>
  <!--
  <nav class="nav-group">
    <h5 class="nav-group-title">Favorites</h5>

    <div each={mailbox, i in view.listMailboxes}>
      <a class="nav-group-item { view.selectedMailBox.list[mailbox.uuid] }" onclick={ openMailBox.bind(this, mailbox.uuid) } id="mailbox_span_{ mailbox.uuid }">
                { mailbox.name }
      </a>
    </div>
  </nav>
  -->

  <ul class="nav">
    <li class="nav-item" each={mailbox, i in view.listMailboxes}>
      <a href="#" onclick={ openMailBox.bind(this, mailbox.uuid) }>
        <span id="mailbox_span_{ mailbox.uuid }" class={ view.selectedMailBox.list[mailbox.uuid] }>{ mailbox.name }</span>
      </a>
    </li>
  </ul>

  <script>
      const view = new View({
        listMailboxes: [],
        selectedMailBox: {
          n: null,
          list: {},
        },
        listMails: [],
      }, this);

      openMailBox(uuid, e) {
        e.preventDefault();
        view.restore('listMails');
        const listMailboxes = state.get('listMailboxes');
        const index = _.findIndex(listMailboxes, (m) => {
          return m.uuid === uuid;
        });
        const mailbox = listMailboxes[index];
        gmailler.getMailbox('main', {
          listMails: [],
          mailbox,
          from: -10,
        });
        state.sets({
          mailbox: {
            target: mailbox,
            from: -20,
          },
          mailboxLabel: mailbox.name,
          openMailbox: uuid,
        });
      }

      function viewUnreadCount(listMailboxes) {
        listMailboxes.forEach((mailbox, i) => {
          const ele = document.querySelector(`#mailbox_span_${mailbox.uuid}`);
          if (mailbox.unreadCount > 0) {
            if (ele.hasAttribute('data-badge')) {
              ele.removeAttribute('data-badge');
            }
            if (ele.classList.contains('badge')) {
              ele.classList.remove('badge');
            }
            ele.setAttribute('data-badge', mailbox.unreadCount);
            ele.classList.add('badge');
          } else {
            ele.removeAttribute('data-badge');
            ele.classList.remove('badge');
          }
        });
      }

      state.observe('listMailboxes', (cur, old) => {
        const updates = [];
        const list = [];

        const oldlist = _.keyBy(old, (o) => {
          return o.uuid;
        });
        cur.forEach((c) => {
          if (!oldlist || !oldlist[c.uuid] || (c.unreadCount !== oldlist[c.uuid].unreadCount)) {
            list.push(c);
          }
        });
        // どこかのタイミングでindexedDBを更新
        if (updates.length > 0) {
          db.bulkPut('mailboxes', updates);
        }
        viewUnreadCount(list);
      });

      function setViewInit() {
        gmailler.onListMailboxes(async (listMailboxes) => {
          let listboxes = await db.all('mailboxes', 'uuid');
          const selectedMailBox = view.get('selectedMailBox');
          listMailboxes.forEach((mail) => {
            mail.unreadCount = listboxes[mail.uuid].unreadCount
            selectedMailBox.list[mail.path] = null;
          });
          view.sets({
            listMailboxes,
            selectedMailBox
          });
          state.set('listMailboxes', listMailboxes);
        });

        gmailler.onUnreadlistMailboxes((listMailboxes) => {
          state.set('listMailboxes', listMailboxes);
        });
      }

      state.observe('listMails', (name) => {
        const uuid = state.get('openMailbox');

        const selectedMailBox = view.get('selectedMailBox');
        const ele = document.querySelector(`#mailbox_span_${uuid}`);
        const oldClass = ele.classList.value;
        if (selectedMailBox.n !== null) selectedMailBox.list[selectedMailBox.n] = oldClass;
        selectedMailBox.n = uuid;
        selectedMailBox.list[uuid] = `${oldClass} label label-primary`;
        view.sets({
          selectedMailBox
        });
      });

      this.on('mount', () => {
        // setViewInit();
        gmailler.onListMailboxes(async (listMailboxes) => {
          let listboxes = await db.all('mailboxes', 'uuid');
          const selectedMailBox = view.get('selectedMailBox');
          console.log('listMailboxes', listMailboxes);
          listMailboxes.forEach((mail) => {
            if (listboxes[mail.uuid]) {
              mail.unreadCount = listboxes[mail.uuid].unreadCount
            }
            selectedMailBox.list[mail.path] = null;
          });
          view.sets({
            listMailboxes,
            selectedMailBox
          });
          state.set('listMailboxes', listMailboxes);
        });

        gmailler.onUnreadlistMailboxes((listMailboxes) => {
          state.set('listMailboxes', listMailboxes);
        });
      });
  </script>
</mailer-nav>