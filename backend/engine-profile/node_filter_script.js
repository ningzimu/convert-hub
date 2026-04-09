function filter(node) {
    const method = node.EncryptMethod.toLowerCase();
    if (node.Type === 1 && (method === 'chacha20-poly1305' || method === 'ss')) {
        return true;
    }
    return false;
}
