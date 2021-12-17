export default class View {
	constructor(id, name, width, height) {
		this.name = name;
		this.totalTick = 0;
		this.tickCounter = 0;
		this.result = document.querySelector(`#${id}>.result`);
		this.ctx = this.initContext(id, width, height);
		this.imageData = new ImageData(width, height);
		this.width = width;
		this.height = height;
	}

	initialize() {
		const data = new Uint32Array(this.imageData.data.buffer);
		data.fill(0xff000000);
		this.mutation((data.length * .25) | 0);
	}

	mutation(count) {
		const data = new Uint32Array(this.imageData.data.buffer);
		for (let i = count; i > 0; --i)
			data[(Math.random() * data.length) | 0] = Math.random() >= .5 ? 0xffffffff : 0xff000000;
	}

	update() {
		this.totalTick += this.step();
		this.tickCounter += 1;
		// this.mutation(.05);

		const fixed = v => (v * 1000 | 0) / 1000;
		const stepAvg = fixed(this.totalTick / this.tickCounter);
		const copyTick = fixed(this.copy());
		const total = fixed(stepAvg + copyTick);
		this.result.innerHTML = `${this.name}: ${total} ms<br>(kernel: avg. ${stepAvg} ms + Copy to ImageData: ${copyTick ? `${copyTick} ms` : 'directly'})`;
	}

	show() { this.ctx.putImageData(this.imageData, 0, 0); }

	initContext(id, width, height) {
		const e = document.querySelector(`#${id}>.screen`);
		if (!e || !e.getContext)
			return null;
		e.width = width;
		e.height = height;
		e.style.maxWidth = '100%';
		return e.getContext('2d');
	}

	bufferType() { return toString.call(this.imageData.data); }
}
