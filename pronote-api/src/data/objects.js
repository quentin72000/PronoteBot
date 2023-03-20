function fromPronote({ N, L, G, url, ...obj } = {}, fn = null, gName = 'type') {
    const result = {};

    if (typeof fn === 'string') {
        gName = fn;
        fn = null;
    }

    if (N) {
        result.id = N;
    }
    if (L) {
        result.name = L;
    }
    if (G !== undefined && gName) {
        result[gName] = G;
    }

    if(url){
        result.link = url
    }

    return {
        ...result,
        ...(fn ? fn(G && gName ? obj : { G, ...obj }) : {})
    };
}

function toPronote({ id, name, type } = {}) {
    const result = {};

    if (id) {
        result.N = id;
    }
    if (name) {
        result.L = name;
    }
    if (type) {
        result.G = type;
    }

    return result;
}

module.exports = {
    fromPronote,
    toPronote
};
