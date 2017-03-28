<nav-children>
  <ul class="nav">
    <li class="nav-item" each={mailbox, i in view.listMailboxes}>
      <a href="#" onclick={ openMailBox.bind(this, mailbox.uuid) }>
        <span id="mailbox_span_{ mailbox.uuid }" class={ view.selectedMailBox.list[mailbox.uuid] }>{ mailbox.name }</span>
      </a>
    </li>
  </ul>

  <script>
    this.on('mount', async() => {
      this.opts;
    });
  </script>
</nav-children>