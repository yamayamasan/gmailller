<mail-content>
  <div class="card overflowX">
    <div class="card-header">
      <h4 class="card-title">{ view.mail.subject }</h4>
      <h6 class="card-meta"></h6>
    </div>
    <div class="card-body" id="body_{ view.mail.uid }">

    </div>
    <div class="card-footer">
      <button class="btn btn-primary" onclick={ reply }>Reply</button>
    </div>
    <!-- reply -->
    <div class="reply__{ view.mail.uid }" if={ view.showReply }>
      <div>
        <form>
          <!-- form input control -->
          <div class="form-group">
            <label class="form-label" for="to">email</label>
            <input class="form-input" type="text" id="to" name="to" placeholder="" oninput={helper.input} value={ view.reply.email }/>
          </div>
          <!-- form textarea control -->
          <div class="form-group">
            <label class="form-label" for="message">Message</label>
            <textarea class="form-input" id="message" name="message" placeholder="" rows="3" oninput={helper.input}></textarea>
          </div>
          <div class="form-group">
            <button type="button" class="btn btn-sm" onclick={ replyExec }>reply</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <style>
    .overflowX {
      overflow-x: scroll;
    }
  </style>
  <script>
    const helper = new Helper(this);
    const view = new View({
      subject: null,
      uid: null,
      showReply: false,
      mail: {
        subject: null,
        uid: null
      },
      reply: {
        email: null,
      }
    }, this);

    replyExec() {
      const reply = view.get('reply')
      const auth = storage.get('gmail');
      gmailler.postMessage('main', {
        auth,
        from: auth.user,
        message: {
          to: helper.getValue('to') || reply.email,
          subject: 'Test',
          text: helper.getValue('message'),
        }
      });
      gmailler.onPostMessage();
    }

    reply(uid, e) {
      const mail = view.get('mail');
      const to = mail.from.value[0].address;
      view.sets({
        showReply: !view.get('showReply'),
        reply: {
          email: to,
        }
      });
    }

    this.on('mount', async function() {
      view.sets({
        mail: this.opts,
      });
      // $$(`#body_${this.opts.uid}`).innerHTML = this.opts.content.replace(/\r\n|\r|\n/g, '<br />');
      $$(`#body_${this.opts.uid}`).innerHTML = this.opts.content;
    });
  </script>
</mail-content>