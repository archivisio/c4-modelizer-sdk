# Publishing Guide - C4 Modelizer SDK

## 🚀 Automatic Publishing (Recommended)

### Via GitHub Release

1. **Create a version tag:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **GitHub Actions automatically triggers** and:
   - Creates a GitHub release
   - Publishes package to GitHub Packages
   - Tests installation

### Via Manual Workflow

1. **Go to GitHub Actions**
2. **Select "Publish to GitHub Packages"**
3. **Click "Run workflow"**
4. **Optional:** Specify a custom version

## 📦 Manual Publishing

### Prerequisites

1. **GitHub Authentication:**
   ```bash
   npm login --registry=https://npm.pkg.github.com
   # Use your GitHub username and Personal Access Token as password
   ```

2. **Configure registry:**
   ```bash
   npm config set @archivisio:registry https://npm.pkg.github.com
   ```

### Publishing Steps

1. **Verify everything works:**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

2. **Test the package:**
   ```bash
   npm run pack:check
   ```

3. **Update version (if needed):**
   ```bash
   npm version patch   # 1.0.0 -> 1.0.1
   npm version minor   # 1.0.0 -> 1.1.0
   npm version major   # 1.0.0 -> 2.0.0
   ```

4. **Publish:**
   ```bash
   npm run publish:github
   ```

## 🔍 Post-Publication Verification

### Verify Publication

1. **On GitHub Packages:**
   - Go to `https://github.com/archivisio/c4-modelizer-sdk/packages`
   - Verify the new version is listed

2. **Test installation:**
   ```bash
   # In a test project
   npm install @archivisio/c4-modelizer-sdk@latest
   ```

### Integration Test

```bash
# Create test project
mkdir test-sdk && cd test-sdk
npm init -y
npm install react react-dom zustand @xyflow/react
npm config set @archivisio:registry https://npm.pkg.github.com
npm install @archivisio/c4-modelizer-sdk

# Test import
node -e "console.log(Object.keys(require('@archivisio/c4-modelizer-sdk')))"
```

## 📋 Publishing Checklist

- [ ] ✅ Tests pass (`npm run type-check`, `npm run lint`)
- [ ] 🏗️ Build succeeds (`npm run build`)
- [ ] 📦 Package is correct (`npm run pack:check`)
- [ ] 📝 README.md updated
- [ ] 🔢 Version incremented appropriately
- [ ] 🏷️ Git tag created (for automatic publishing)
- [ ] ✅ Post-publication installation tests

## 🛠️ Troubleshooting

### Authentication Error

```bash
# Check configuration
npm config get registry
npm config get @archivisio:registry

# Re-configure if needed
npm logout --registry=https://npm.pkg.github.com
npm login --registry=https://npm.pkg.github.com
```

### Permission Error

1. **Verify Personal Access Token has permissions:**
   - `write:packages`
   - `read:packages` 
   - `delete:packages` (optional)

2. **Verify organization/user:**
   - Package must be published under `@archivisio/`
   - User must have rights on this namespace

### Package Already Published

```bash
# Increment version
npm version patch
# Then republish
npm run publish:github
```

## 🔄 Version Management

### Semantic Versioning

- **PATCH** (1.0.x) : Bug fixes, minor corrections
- **MINOR** (1.x.0) : New features, compatible improvements
- **MAJOR** (x.0.0) : Breaking changes, API modifications

### Branches and Versions

- **main** : Stable versions (tags v*.*.*)
- **develop** : Development in progress
- **feature/** : New features
- **hotfix/** : Urgent fixes

## 📚 Resources

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [npm Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning)
- [GitHub Actions](https://docs.github.com/en/actions)