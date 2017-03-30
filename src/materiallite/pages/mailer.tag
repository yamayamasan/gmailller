<mailer>
  <mailer-nav></mailer-nav>
  <mailer-box></mailer-box>
  <script>
    openMarkdown() {
      const markdownTag = riot.mount('#markdown', 'markdown');
    }

    search() {
      (async function () {
        const mailbox = state.get('mailbox.target');
        const listMails = await gmail.search(mailbox.path, {
          unseen: true
        });
      }).call();
    }

    const observer = (name) => {
      (async function () {
        const auth = storage.get('gmail');
        gmailler.observer('observer.inbox', {
          auth
        }, (message) => {
          console.log(message);
        });
      }).call();
    }

    this.on('mount', function () {
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