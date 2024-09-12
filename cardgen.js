const CardTypes = {
	"Basic": {
		"colorType": "#BED8C1",
		"colorCardBorder": "#003f06",
		"colorShapeFill": "#255629C0",
		"colorShapeBorder": "#003104",
	},
	"Skilled": {
		"colorType": "#0DC2F0",
		"colorCardBorder": "#00243f",
		"colorShapeFill": "#0055dfC0",
		"colorShapeBorder": "#00236f",
	},
	"Champion": {
		"colorType": "#A183C1",
		"colorCardBorder": "#353535",
		"colorShapeFill": "#5f3279C0",
		"colorShapeBorder": "#13012f",
	},
	"Environment": {
		"colorType": "#C7C7C7",
		"colorCardBorder": "#797979",
		"colorShapeFill": "#a0a0a0C0",
		"colorShapeBorder": "#545454",
	},
	"Explore": {
		"colorType": "#E5DDB0",
		"colorCardBorder": "#b5923e",
		"colorShapeFill": "#CCCC57C0",
		"colorShapeBorder": "#a88531",
	}
};

class CardGen {

	static CARD_WIDTH = 506;
	static CARD_HEIGHT = 702;

	static async Initialize() {
		btnMakeCard.addEventListener("click", () => {
			this.CollectCardInfo();
			this.DrawCard();
		});
		
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
	}

	static CollectCardInfo() {
		let cardTypeKey = infoCardType.options[infoCardType.selectedIndex].value;
		this.cardInfo = {
			type: cardTypeKey,
			typeObj: CardTypes[cardTypeKey],
			variant: infoCardTypeVariant.value,
			name: infoCardName.value,
			desc: infoCardDesc.value,
			comment: infoCardComment.value,
		}
	}

	static HighlightReplacer(string) {
		// To Play, Battlecry, Deathrattle
		string = string.replace(/^(Battlecry|Deathrattle|To Play): (.+)$/gm, (match, p1, p2) => {
			return `<span class=color_battlecry_deathrattle>${p1}: </span>${p2}`;
		});
		// Showstopper
		string = string.replace(/^(Showstopper): (.+)$/gm, (match, p1, p2) => {
			return `<span class=color_showstopper>${p1}: </span>${p2}`;
		});
		// Overdrive
		string = string.replace(/^(Overdrive \w+): (.+)$/gm, (match, p1, p2) => {
			return `<span class=color_overdrive>${p1}: </span>${p2}`;
		});
		// Burst
		string = string.replace(/^(Burst): (.+)$/gm, (match, p1, p2) => {
			return `<span class=color_burst>${p1}: </span>${p2}`;
		});

		return string;
	}

	static RenderHTMLToCanvas(element, posX = 0, posY = 0) {
		if (IsNullOrWhitespace(element.innerText))
			return;

		//console.log(element);
	
		let options = {
			allowTaint: true,
			canvas: this.canvas,
			backgroundColor: null,
			x: -posX, // WHY IS IT NEGATIVE
			y: -posY
		};

		this.ctx.save();
		let prom = html2canvas(element, options).then((cvs) => {
			CardGen.ctx.restore();
		});
	}

	static OUTER_BORDER_WIDTH = 6;
	static SHAPE_BORDER_WIDTH = 4;

	static DrawPath(path, fill = true, stroke = true) {
		console.log(path)
		if (fill)
			this.ctx.fill(path);
		if (stroke)
			this.ctx.stroke(path);
	}

	static CreateRoundedRectPath(borderWidth, x, y, width, height, radii, existingPath) {
		if (borderWidth < 0)
			borderWidth = this.ctx.lineWidth;

		let path = existingPath == null ? new Path2D() : existingPath;
		path.roundRect(x + (borderWidth/2), y + (borderWidth/2), width - borderWidth, height - borderWidth, radii);
		return path;
	}

	static DrawBackground(imgBackground) {
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorCardBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorType;
		this.ctx.lineWidth = this.OUTER_BORDER_WIDTH;
		
		this.ctx.beginPath();
		let path = this.CreateRoundedRectPath(-1, 0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 27);
		this.ctx.fill(path);
		if (imgBackground != null)
			this.ctx.drawImage(imgBackground, 0, 0);
		this.ctx.stroke(path);
	}

	static DrawIcon() {

	}

	static DrawTypeShape() {
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorShapeBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorShapeFill;
		this.ctx.lineWidth = this.SHAPE_BORDER_WIDTH;
		
		// https://developer.mozilla.org/en-US/docs/Web/API/Path2D
		let path = new Path2D();
		this.ctx.beginPath();
		
		switch (this.cardInfo.type) {
			case "Basic":
				this.CreateRoundedRectPath(-1, 36, 21, 434, 79, 8, path);
				break;
			case "Skilled":
				path.lineTo(15, 15);
				path.arcTo(500, 15, 500, 100, 100);
				path.closePath();
				break;
			case "Champion":
				break;
			case "Environment":
				break;
			case "Explore":
				this.CreateRoundedRectPath(-1, 13, 12, 480, 74, 8, path);
				
				if (!IsNullOrWhitespace(this.cardInfo.variant))
					this.CreateRoundedRectPath(-1, 149, 82, 209, 49, 8, path);
				break;
		}

		this.ctx.fill(path);
		this.ctx.stroke(path);
	}

	static DrawDescriptionBox() {
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorShapeBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorShapeFill;
		this.ctx.lineWidth = this.SHAPE_BORDER_WIDTH;
		
		this.ctx.beginPath();
		this.DrawPath(this.CreateRoundedRectPath(this.SHAPE_BORDER_WIDTH, 19, 448, 468, 234, 8));
	}

	static DrawStats() {
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorShapeBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorShapeFill;
		this.ctx.lineWidth = this.SHAPE_BORDER_WIDTH;
		
		this.ctx.beginPath();
		this.DrawPath(this.CreateRoundedRectPath(this.SHAPE_BORDER_WIDTH, 33, 396, 440, 56, 8));
	}

	static DrawText() {
		let rectName = renderCardName.getBoundingClientRect();
		let xOffName = (this.CARD_WIDTH - rectName.width) / 2;
		let yOffName = 35;
		if (this.cardInfo.type == "Explore")
			yOffName -= 12;
		this.RenderHTMLToCanvas(renderCardName, xOffName, yOffName);

		if (this.cardInfo.type == "Explore") {
			let rectVariant = renderCardTypeVariant.getBoundingClientRect();
			let xOffVariant = (this.CARD_WIDTH - rectVariant.width) / 2;
			this.RenderHTMLToCanvas(renderCardTypeVariant, xOffVariant, 93);
		}

		let rectDesc = renderCardDesc.getBoundingClientRect();
		let xOffDesc = (this.CARD_WIDTH - rectDesc.width) / 2;
		this.RenderHTMLToCanvas(renderCardDesc, xOffDesc, 454);

		let rectComment = renderCardComment.getBoundingClientRect();
		let xOffComment = (this.CARD_WIDTH - rectComment.width) / 2;
		this.RenderHTMLToCanvas(renderCardComment, xOffComment, 677 - rectComment.height);
	}

	static DrawCard() {
		this.ctx.clearRect(0,0,999,999);

		this.ApplyToTemporaryRender();

		this.DrawBackground();
		//this.DrawIcon();
		this.DrawTypeShape();
		this.DrawDescriptionBox();
		this.DrawStats();
		this.DrawText();
	}

	static ApplyToTemporaryRender() {
		let desc = this.cardInfo.desc;
		if (optionAutoHighlightDesc.checked)
			desc = this.HighlightReplacer(desc);
		desc = desc.replaceAll("\n", "<br>");
		
		renderCardTypeVariant.innerHTML = infoCardTypeVariant.value;
		renderCardName.innerHTML = infoCardName.value;
		renderCardDesc.innerHTML = desc;
		renderCardComment.innerHTML = infoCardComment.value;
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	CardGen.Initialize();
});