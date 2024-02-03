function getCurrentTrimester(session, date = new Date()) {
    const trimesters = session.params.periods.filter((x) => x.kind === "trimester");
    const trimester = trimesters.find((x) => x.from <= date && x.to >= date);
    if (trimester === undefined) {
        throw new Error("Can't find the current trimester. Is the year over or not started?");
    }
    return trimester;
}

module.exports = { getCurrentTrimester };