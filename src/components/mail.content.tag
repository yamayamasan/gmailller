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

    this.on('mount', async function() {
      view.sets({
        subject: this.opts.subject,
        uid: this.opts.uid,
      });
      $$(`#body_${this.opts.uid}`).innerHTML = this.opts.content;
    });
  </script>
</mail-content>