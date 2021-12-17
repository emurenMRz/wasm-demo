import View from './view.js';

const WIDTH = 1920;
const HEIGHT = 1080;

/**
 * View for TypedArray
 */
class ViewTA extends View {
	step() {
		const begin = performance.now();
		this.stepDetail(new Uint32Array(this.imageData.data.buffer), this.width, this.height);
		return performance.now() - begin;
	}

	copy() { return 0; }

	stepDetail(data, width, height) {
		let index = width;
		for (let y = height - 2; y > 0; --y) {
			for (let x = 1; x < width - 1; ++x) {
				const offset = index + x;
				const count = (data[offset - width - 1] & 0x1)
					+ (data[offset - width] & 0x1)
					+ (data[offset - width + 1] & 0x1)
					+ (data[offset - 1] & 0x1)
					+ (data[offset + 1] & 0x1)
					+ (data[offset + width - 1] & 0x1)
					+ (data[offset + width] & 0x1)
					+ (data[offset + width + 1] & 0x1);
				if (data[offset] & 0x1) {
					if (count <= 1 || count >= 4)
						data[offset] = 0xff000000;
				}
				else if (count == 3)
					data[offset] = 0xffffffff;
			}
			index += width;
		}
	}
}

/**
 * View for WebAssembly
 */
class ViewWASM extends View {
	constructor(id, name, width, height, exports) {
		super(id, name, width, height);
		this.exports = exports;

		const IMAGE_BYTE_SIZE = width * height * 4;
		let memory = exports.memory;
		if (!memory)
			memory = new WebAssembly.Memory({ initial: ((IMAGE_BYTE_SIZE + 0xffff) >>> 16) + 2 });
		else
			memory.grow((IMAGE_BYTE_SIZE + 0xffff) >>> 16)
		this.IMAGE_ADDRESS = 2 << 16;
		this.image_buffer = new Uint8Array(memory.buffer, this.IMAGE_ADDRESS, IMAGE_BYTE_SIZE);
	}

	initialize(data) { this.image_buffer.set(data); }

	step() {
		const begin = performance.now();
		this.exports.step(this.IMAGE_ADDRESS, this.width, this.height);
		return performance.now() - begin;
	}

	copy() {
		const begin = performance.now();
		this.imageData.data.set(this.image_buffer);
		return performance.now() - begin;
	}
}

/**
 * main
 */
document.getElementById('canvas-size').textContent = `CANVAS size: ${WIDTH} x ${HEIGHT}`;

WebAssembly.instantiateStreaming(fetch('lifegame.wasm'), { env: { random: () => Math.random(), } })
	.then(results => {
		const viewTA = new ViewTA('view1', 'Using TypedArray only', WIDTH, HEIGHT);
		const viewWASM = new ViewWASM('view2', 'Using WebAssembly', WIDTH, HEIGHT, results.instance.exports);

		viewTA.initialize();
		viewWASM.initialize(viewTA.imageData.data);

		(function core() {
			viewTA.update();
			viewWASM.update();
			viewTA.show();
			viewWASM.show();
			setTimeout(core, 250);
		})();
	});