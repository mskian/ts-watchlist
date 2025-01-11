# Movie & Series Watchlist

Movie & Series Watchlist web app | Manage Your Watchlist with Ease  

**Note**  

I primarily built this tool for personal use, and I mostly run it on my home server or localhost.This tool is not recommended for production use, as it lacks additional security layers such as header authentication, API keys, or token methods to prevent unauthorized access. However, you are welcome to fork the project and make any changes as needed.  

> Base Concept: <https://github.com/mskian/watchlist>  

## Setup

- Download or Clone the repo
- install dependencies

```sh
pnpm install
```

- create `.env` file to add a Auth key (default password: 123456)

```env
AUTH_KEY=<your custom auth key>
``

- Development

```sh
pnpm dev
```

- Build a Project

```sh
pnpm build
```

- Start the server

```sh
pnpm start
```

```sh

## Home Page (Watchlist)
http://localhost:6020/

## Add New Item
http://localhost:6020/dashboard

```

## LICENSE

MIT
