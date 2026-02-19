# fr0g Protocol

**Decentralized File System Protocol on Stellar (Testnet-Focused)**

fr0g is a **decentralized file system protocol** built on the Stellar blockchain. It defines clear, immutable rules for permanently storing, retrieving, and managing files directly on-chain — without servers, without central authorities, and with strong built-in censorship resistance.

Files are treated as native on-chain objects: split into small chunks, stored via Stellar's ManageData operations, optionally compressed, and made discoverable through public indexers. The protocol enforces strict rules for ownership, chunking, discoverability, deletion, and reserve recovery — making it a true decentralized filesystem primitive.

**Currently designed and optimized exclusively for Stellar Testnet** — 100% free, zero real XLM cost.  
Mainnet support is technically possible using the exact same code, but remains in active development and is not yet recommended for production use. By default, fr0g operates on Testnet. Ongoing work focuses on improving long-term data persistence and robustness on Testnet.

The protocol is fully client-agnostic: any software can read from or write to it following the defined rules. **Ribbit** is the official reference client (browser-based), but developers are encouraged to build alternative implementations.

---

## For Everyone

### What is fr0g?
fr0g lets you store images, videos, websites, code, JSON, documents — any kind of file — permanently and immutably as part of the Stellar blockchain.

It acts like a decentralized filesystem:  
- Files are automatically split into ≤64-byte chunks  
- Stored on-chain via immutable ManageData entries  
- Replicated across the entire Stellar validator network  
- Only the owner can modify or delete  
- Nearly all XLM reserves are recoverable on deletion  

Once uploaded, content cannot be removed by any single entity (governments, companies, ISPs) without a majority attack on Stellar itself.

### Why fr0g?
- **Extreme censorship resistance** — no servers, no DNS, no gatekeepers  
- **True permanence** — lives as long as Stellar exists  
- **100% free on Testnet** — no real XLM cost whatsoever  
- **Near-full reserve recovery** when you delete  
- **Human-readable IDs** — easy to share (fr0g…Z5NBG)  
- **Any file type** supported  
- **Optional public discoverability** via category indexers  
- **Client-agnostic** — use Ribbit or build your own tool

### Key Features
- Automatic gzip compression for text-based files  
- Up to 100 files per fr0g ID (indices 0–99)  
- Optional short description (max 25 characters)  
- Public category indexers: Images, Videos, Websites, Code, Raw  
- Full owner control: create, read, delete  
- Designed for Testnet (Mainnet support in progress)

### How It Works (Simple Version)
1. Generate a fr0g ID (a special Stellar-derived address)  
2. Upload your file — it is chunked, optionally compressed, and written on-chain  
3. (Optional) make it discoverable by sending a memo to a public category indexer  
4. Anyone with the fr0g ID can instantly view/download the content  
5. Only you can delete it and recover nearly all XLM spent

### Official Client – Ribbit
Ribbit is the official browser-based client for interacting with the fr0g protocol.  
It offers a clean interface to generate IDs, upload files, browse public content, and manage your stored data — all running entirely in the browser.

→ [Open Ribbit](https://0ut0flin3.github.io/fr0g-protocol/frontend/index.html)

The protocol is intentionally client-agnostic — you can build alternative tools, mobile apps, CLI clients, or integrations in any language.

---

## For Developers

### Protocol Deep Dive

#### Core Concepts
- **fr0g ID**: human-readable identifier (reversed Stellar public key + "fr0g" prefix)  
- **Chunking**: files split into ≤64-byte pieces to fit Stellar ManageData limit  
- **Storage**: all data stored via ManageData operations on dedicated accounts  
- **Censorship Resistance**: content replicated across all Stellar validators  
- **Discoverability**: optional memo transaction to fixed category indexers  
- **Deletion**: owner-only, removes chunks and recovers ~all reserves

#### Python Reference Implementation (core/fr0g.py)
The reference implementation is in `core/fr0g.py`. Minimal dependencies.

```bash
pip install requests
```

```python
import fr0g

# Generate fr0g ID
id, secret = fr0g.random_keypair(enabled=True)
print("fr0g ID:", id)

# Upload example
content = b"<h1>Hello, fr0g!</h1>"
tx = fr0g.upload(content, secret, 0, make_discoverable=True, description="Simple test")
print("Transaction hash:", tx['id'])

# Retrieve content
content_bytes, mime = fr0g.get_content(id, 0)
print("Mime type:", mime)
print("Content:", content_bytes

# Delete the file at the specified index
fr0g.remove_file(id, 0, secret)

# Delete all files at once
fr0g.remove_all(id,secret)

# Inspect on-chain data
print(fr0g.retrieve_data(id))
```

### JavaScript Client (fr0g.js)
fr0g.js is a small, in-browser clone of the original Python core.  
It executes the same logic via Pyodide and provides identical function names and behavior (random_keypair, upload, get_content, remove_file, retrieve_data).

Used by Ribbit and suitable for any web-based fr0g tool.

```html
<script src="fr0g.js"></script>
```

```javascript
await fr0g.init();

const [id, secret] = await fr0g.random_keypair(1);

const file = new File(["<h1>Test</h1>"], "test.html");
await fr0g.upload(file, secret, 0, 1, "Test file");

const [content, mime] = await fr0g.get_content(id, 0);
```

### Repository Structure
```
fr0g-protocol/
├── core/
│   ├── fr0g.py              # Core protocol logic (Python reference)
│   └── ed25519_ext.py       # Extended ed25519 utilities
├── frontend/
│   ├── fr0g.js              # Browser client (Pyodide-based core clone)
│   └── index.html           # Ribbit – official web viewer
├── LICENSE
└── README.md
```

### Important Notes
- **Testnet only (for now)**: the protocol is designed, tested, and intended for exclusive use on Stellar Testnet. Mainnet is technically supported but still under active development and not yet production-ready.
- **100% free on Testnet**: no real XLM cost.
- **Client-agnostic**: Ribbit is the official reference client — build your own in any language.

### Donate
Support protocol development, indexer maintenance, and future Mainnet readiness:  
**Stellar (XLM):**  
GDJDYV2WWEWXR4TUQY3TOCA5AF55PXNKRDQT7U2T3C6ZKARMOHYLPHWZ

---

**fr0g Protocol** — A decentralized file system on Stellar.  
Store once. Own forever. Resistant by design.  
Testnet-first. Mainnet coming.