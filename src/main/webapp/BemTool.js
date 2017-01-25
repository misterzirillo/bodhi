export default (block, element, modifier) => {
	let prefix, ret;
	if (!element) {
		prefix = block;
	} else {
		prefix = block + '__' + element;
	}
	if (modifier) {
		if (modifier instanceof Array) {
			ret = [ prefix ].concat(modifier.map(mod => prefix + '--' + mod));
		} else {
			ret = [ prefix, prefix + '--' + modifier ];
		}
	} else {
		ret = prefix;
	}
	return ret instanceof Array ? ret.join(' ') : ret;
};
