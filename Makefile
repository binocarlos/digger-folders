build: components
	@component build --dev

components: component.json
	@component install --dev

templates:
	@component convert template.html

clean:
	rm -fr build components

.PHONY: clean
