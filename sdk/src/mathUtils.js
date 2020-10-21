const BigNumber = require('bignumber.js');
const BONE = new BigNumber(10).pow(18);
const BPOW_PRECISION = BONE.idiv(new BigNumber(10).pow(10));
const EXIT_FEE = new BigNumber(0);

function btoi(a) {
	return a.idiv(BONE);
}

function bfloor(a) {
	return btoi(a).times(BONE);
}

function bsubSign(
	a,
	b
) {
	if (a.gte(b)) {
		const res = a.minus(b);
		const bool = false;
		return {
			res,
			bool
		};
	} else {
		const res = b.minus(a);
		const bool = true;
		return {
			res,
			bool
		};
	}
}

function bmul(a, b) {
	const c0 = a.times(b);
	const c1 = c0.plus(BONE.div(new BigNumber(2)));
	const c2 = c1.idiv(BONE);
	return c2;
}

function bdiv(a, b) {
	const c0 = a.times(BONE);
	const c1 = c0.plus(b.div(new BigNumber(2)));
	const c2 = c1.idiv(b);
	return c2;
}

function bpowi(a, n) {
	let z = !n.modulo(new BigNumber(2)).eq(new BigNumber(0)) ? a : BONE;

	for (
		n = n.idiv(new BigNumber(2)); !n.eq(new BigNumber(0)); n = n.idiv(new BigNumber(2))
	) {
		a = bmul(a, a);
		if (!n.modulo(new BigNumber(2)).eq(new BigNumber(0))) {
			z = bmul(z, a);
		}
	}
	return z;
}

function bpowApprox(
	base,
	exp,
	precision
) {
	const a = exp;
	const {
		res: x,
		bool: xneg
	} = bsubSign(base, BONE);
	let term = BONE;

	let sum = term;
	let negative = false;
	for (let i = 1; term.gte(precision); i++) {
		const bigK = new BigNumber(i).times(BONE);
		const {
			res: c,
			bool: cneg
		} = bsubSign(a, bigK.minus(BONE));
		term = bmul(term, bmul(c, x));
		term = bdiv(term, bigK);
		if (term.eq(new BigNumber(0))) break;

		if (xneg) negative = !negative;
		if (cneg) negative = !negative;
		if (negative) {
			sum = sum.minus(term);
		} else {
			sum = sum.plus(term);
		}
	}
	return sum;
}

function bpow(base, exp) {
	const whole = bfloor(exp);
	const remain = exp.minus(whole);
	const wholePow = bpowi(base, btoi(whole));
	if (remain.eq(new BigNumber(0))) {
		return wholePow;
	}

	const partialResult = bpowApprox(base, remain, BPOW_PRECISION);
	return bmul(wholePow, partialResult);
}

module.exports = {
	bpow,
	bdiv,
	bmul,
	BONE,
	EXIT_FEE
}