<mail-content>
  <div class="card overflowX">
    <div class="card-header">
      <h4 class="card-title">{ view.subject }</h4>
      <h6 class="card-meta"></h6>
    </div>
    <div class="card-body" id="body_{ view.uid }">

    </div>
    <div class="card-footer">
      <button class="btn btn-primary">Do</button>
    </div>
  </div>
  <style>
    .overflowX {
      overflow-x: scroll;
    }
  </style>
  <script>
    const view = new View({
      subject: null,
      uid: null,
    }, this);

    this.on('mount', function() {
      console.log(this);
      const mail = this.opts.mail;
      const uid = this.opts.uid;
      view.sets({
        subject: mail.subject,
        uid,
      });
      $$(`#body_${uid}`).innerHTML = mail.content;
    });
  </script>
</mail-content>