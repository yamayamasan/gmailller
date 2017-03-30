<mail-content>
  <div class="mdl-shadow--2dp">
    <div class="mdl-card__title mdl-card--expand">
      <h2 class="mdl-card__title-text">{ view.mail.subject }</h2>
    </div>
    <div class="mdl-card__supporting-text" id="body_{ view.mail.uid }">
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onclick={ reply }>Reply</a>
    </div>

    <div class="reply__{ view.mail.uid }" if={ view.showReply }>
      <form>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input class="mdl-textfield__input" type="text" id="to" name="to" oninput={helper.input} value={ view.reply.email }/>
          <label class="mdl-textfield__label" for="to"></label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
          <textarea class="mdl-textfield__input" id="message" name="message" placeholder="" rows="3" oninput={helper.input}></textarea>
          <label class="mdl-textfield__label" for="message">Message</label>
        </div>
      </form>
    </div>
  </div>
  <!--
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
    <div class="reply__{ view.mail.uid }" if={ view.showReply }>
      <div>
        <form>
          
          <div class="form-group">
            <label class="form-label" for="to">email</label>
            <input class="form-input" type="text" id="to" name="to" placeholder="" oninput={helper.input} value={ view.reply.email }/>
          </div>
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
  -->
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
                                                                                          subject: 'Test Mail',
                                                                                          text: helper.getValue('message'),
                                                                                        }
                                                                                      });
                                                                                      gmailler.onPostMessage();
                                                                                    }

                                                                                    reply(uid, e) {
                                                                                      console.log('reply');
                                                                                      const mail = view.get('mail');
                                                                                      const to = mail.from.value[0].address;
                                                                                      view.sets({
                                                                                        showReply: !view.get('showReply'),
                                                                                        reply: {
                                                                                          email: to,
                                                                                        }
                                                                                      });
                                                                                    }

                                                                                    this.on('mount', async function () {
                                                                                      view.sets({
                                                                                        mail: this.opts,
                                                                                      });
                                                                                      // $$(`#body_${this.opts.uid}`).innerHTML = this.opts.content.replace(/\r\n|\r|\n/g, '<br />');
                                                                                      $$(`#body_${this.opts.uid}`).innerHTML = this.opts.content;
                                                                                    });
  </script>
</mail-content>