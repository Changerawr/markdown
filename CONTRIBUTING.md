# Contributing

Thanks for wanting to contribute to @changerawr/markdown!

## Quick Start

1. Fork the repo
2. Clone your fork: `git clone <your-fork>`
3. Install deps: `npm install`
4. Make your changes
5. Test: `npm test`
6. Build: `npm run build`
7. Submit a PR

## What We're Looking For

- Bug fixes
- New markdown extensions
- Performance improvements
- Better TypeScript types
- Documentation improvements
- Example projects

## Code Style

- Use TypeScript
- Follow existing patterns
- Write tests for new features
- Keep it simple

## Testing

```bash
npm test          # Run all tests
npm run test:watch   # Watch mode
```

Make sure tests pass before submitting.

## Building

```bash
npm run build     # Build everything
npm run dev       # Watch mode
```

## Extensions

Adding a new extension? Check out `src/extensions/` for examples. Extensions need:

- Parse rules (regex patterns)
- Render rules (HTML output)
- TypeScript types

## Questions?

Open an issue or start a discussion. We're friendly!

## License

By contributing, you agree your contributions will be licensed under MIT.