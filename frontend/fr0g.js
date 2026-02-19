let pyodideReady = null;

const fr0g = {
  async init() {
    if (pyodideReady) return pyodideReady;

    console.log("🐸 [fr0g v0.4.1] Loading Pyodide + real core/ from repository...");

    pyodideReady = (async () => {
      const py = window.pyodide
        ? window.pyodide
        : await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" });

      const base = "https://raw.githubusercontent.com/0ut0flin3/fr0g-protocol/main/core/";
      const [edCode, frCode] = await Promise.all([
        fetch(base + "ed25519_ext.py").then(r => r.text()),
        fetch(base + "fr0g.py").then(r => r.text())
      ]);

      py.FS.mkdirTree("/frog");
      py.FS.writeFile("/frog/ed25519_ext.py", edCode);
      py.FS.writeFile("/frog/fr0g.py", frCode);

      await py.runPythonAsync(`
        import sys
        sys.path.insert(0, "/frog")
        import fr0g
        print("🐸 fr0g Python core loaded - import OK")
      `);

      const frModule = py.globals.get("fr0g");
      fr0g.CONTENT_INDEXERS = frModule.CONTENT_INDEXERS.toJs();

      return py;
    })();

    return pyodideReady;
  },

  async random_keypair(enabled = 1) {
    const py = await this.init();
    const res = await py.runPythonAsync(`fr0g.random_keypair(enabled=${enabled})`);
    return res.toJs();
  },

  async upload(content, secret, index = 0, make_discoverable = 1, description = "") {
    const py = await this.init();

    let bytes;
    if (content instanceof File) {
      bytes = new Uint8Array(await content.arrayBuffer());
    } else if (content instanceof Uint8Array) {
      bytes = content;
    } else {
      bytes = new Uint8Array(content);
    }

    py.FS.writeFile("/tmp/upload.bin", bytes);

    const safeDesc = description.replace(/'/g, "\\'");
    const pyBool = make_discoverable ? "True" : "False";

    const code = `
      fr0g.upload(
        open('/tmp/upload.bin', 'rb').read(),
        '${secret}',
        ${index},
        make_discoverable=${pyBool},
        description='${safeDesc}'
      )
    `;

    const res = await py.runPythonAsync(code);
    return res ? res.toJs() : res;
  },

  async get_content(fr0g_id, index = 0) {
    const py = await this.init();
    const res = await py.runPythonAsync(`fr0g.get_content('${fr0g_id}', ${index})`);
    const tuple = res.toJs();
    const contentBytes = new Uint8Array(tuple[0]);
    return [contentBytes, tuple[1]];
  },

  async remove_file(fr0g_id, index, secret) {
    const py = await this.init();
    return await py.runPythonAsync(`fr0g.remove_file('${fr0g_id}', ${index}, '${secret}')`);
  },

  async retrieve_data(fr0g_id) {
    const py = await this.init();
    const res = await py.runPythonAsync(`fr0g.retrieve_data('${fr0g_id}')`);
    return res.toJs();
  },

  async getLiveFeed(limit = 12) {
    console.log("🐸 getLiveFeed called – fetching from Horizon...");

    const indexers = {
      images: "fr0gar7b4wscthfrqofckuq22clb3usofiud75gozxe26mqavyisrc5bemcg",
      video:  "fr0gmypk54u3b5zytuzhwdbpxcyems234siebxa5wf2htz62smg4hbrtz5ag",
      html:   "fr0gey3nkjwxfi3olj2opkjwzxg2prjxwyld3rxthfuzqd5ssyzisbr3fcbg",
      code:   "fr0g64n6okdmub2vqiiqmupwdtclsqakkbm3idbaz6c3kliddivpgfeetldg",
      raw:    "fr0gcqkdfplmirjr5wxkez75mubdwow3i2ishskhgnesq4iyiishafeef2dg"
    };

    const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

    let items = [];

    for (const [cat, acc] of Object.entries(indexers)) {
      try {
        console.log(`🐸 Fetching from indexer ${cat} (${acc})...`);
        const txPage = await server.transactions()
          .forAccount(acc)
          .limit(8)
          .order("desc")
          .call();

        for (const tx of txPage.records) {
          if (tx.memo_type === "text" && tx.memo?.includes(";")) {
            const [idx, desc] = tx.memo.split(";");
            items.push({
              category: cat,
              description: desc?.trim() || "no description",
              fr0gID: tx.source_account,
              time: new Date(tx.created_at).toLocaleString(),
              index: idx || "0"
            });
          }
        }
      } catch (e) {
        console.warn(`Indexer ${cat} failed:`, e.message);
      }
    }

    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    console.log(`🐸 getLiveFeed returning ${items.length} items`);
    return items.slice(0, limit);
  }
};

window.fr0g = fr0g;
console.log("🐸 fr0g.js v0.4.1 Pyodide + real core/ loaded");