#define WASM_EXPORT __attribute__((visibility("default")))
extern double random();

typedef unsigned int uint32_t;
typedef unsigned int size_t;

WASM_EXPORT
void step(uint32_t *data, size_t width, size_t height)
{
	uint32_t *index = data + width;
	for (int y = height - 2; y > 0; --y)
	{
		for (int x = 1; x < width - 1; ++x)
		{
			uint32_t *px = index + x;
			int count = (px[-width - 1] & 0x1) + (px[-width] & 0x1) + (px[-width + 1] & 0x1) + (px[-1] & 0x1) + (px[+1] & 0x1) + (px[+width - 1] & 0x1) + (px[+width] & 0x1) + (px[+width + 1] & 0x1);
			if (*px & 0x1)
			{
				if (count <= 1 || count >= 4)
					*px = 0xff000000;
			}
			else if (count == 3)
				*px = 0xffffffff;
		}
		index += width;
	}
}
