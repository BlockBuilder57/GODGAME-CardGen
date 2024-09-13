const CARD_SCALE = 1.0;
const CARD_WIDTH = 506 * CARD_SCALE;
const CARD_HEIGHT = 702 * CARD_SCALE;

let CardTypes = {
	"Basic": {
		colorType: "#BED8C1",
		colorCardBorder: "#003f06",
		colorShapeFill: "#255629C0",
		colorShapeBorder: "#003104",
		shapeRect: new DOMRect(40, 20, -1, 80).scale(CARD_SCALE),
	},
	"Skilled": {
		colorType: "#0DC2F0",
		colorCardBorder: "#00243f",
		colorShapeFill: "#0055dfC0",
		colorShapeBorder: "#00236f",
		shapeRect: new DOMRect(20, 20, -1, 80).scale(CARD_SCALE),
	},
	"Champion": {
		colorType: "#A183C1",
		colorCardBorder: "#353535",
		colorShapeFill: "#5f3279C0",
		colorShapeBorder: "#13012f",
		shapeRect: new DOMRect(20, 20, -1, 80).scale(CARD_SCALE),
	},
	"Environment": {
		colorType: "#C7C7C7",
		colorCardBorder: "#797979",
		colorShapeFill: "#a0a0a0C0",
		colorShapeBorder: "#545454",
		shapeRect: new DOMRect(30, 20, -1, 80).scale(CARD_SCALE),
	},
	"Explore": {
		colorType: "#E5DDB0",
		colorCardBorder: "#b5923e",
		colorShapeFill: "#CCCC57C0",
		colorShapeBorder: "#a88531",
		shapeRect: new DOMRect(10, 20, -1, 80).scale(CARD_SCALE),
	}
};

let CardSections = {
	"Background": {
		rect: new DOMRect(0, 0, CARD_WIDTH, CARD_HEIGHT),
		borderWidth: 6 * CARD_SCALE
	},
	"ShapeType": {
		// gotten from ShapeTypes
		rect: null,
		borderWidth: 4 * CARD_SCALE,
	},
	"ShapeTypeVariant": {
		// corrected later to be below ShapeType
		rect: new DOMRect(180, -1, -1, 40).scale(CARD_SCALE),
		borderWidth: 4 * CARD_SCALE,
	},
	"ShapeDescriptionBox": {
		rect: new DOMRect(20, 442, -1, 240).scale(CARD_SCALE),
		borderWidth: 4 * CARD_SCALE,
	},
	"ShapeStatsBox": {
		// corrected later to be above ShapeDescriptionBox
		rect: new DOMRect(50, -1, -1, 54).scale(CARD_SCALE),
		borderWidth: 4 * CARD_SCALE,
	}
};

class CardGen {

	static async Initialize() {
		btnMakeCard.addEventListener("click", async () => {
			this.CollectCardInfo();
			this.CorrectCardSections();
			this.DrawCard();
		});
		
		this.canvas = canvas;
		this.canvas.width = CARD_WIDTH;
		this.canvas.height = CARD_HEIGHT;
		this.ctx = this.canvas.getContext("2d");
	}

	// Corrects widths and such for CardSections
	static CorrectCardSections() {
		// Get ShapeType rect from current card type
		CardSections.ShapeType.rect = this.cardInfo.typeObj.shapeRect;
		
		// Loop through all rects and correct them
		for (let [key, shape] of Object.entries(CardSections)) {
			if (shape.rect == null)
				console.warn("Skipping correction of null rect");

			if (shape.rect.width < 0)
				shape.rect.width = CARD_WIDTH - (shape.rect.x*2);
			if (shape.rect.height < 0)
				shape.rect.height = CARD_HEIGHT - (shape.rect.y*2);
		}

		// Always nestle under ShapeType
		CardSections.ShapeTypeVariant.rect.y = CardSections.ShapeType.rect.y + CardSections.ShapeType.rect.height - CardSections.ShapeType.borderWidth;

		// Always nestle on top of ShapeDescriptionBox
		CardSections.ShapeStatsBox.rect.y = CardSections.ShapeDescriptionBox.rect.y - CardSections.ShapeStatsBox.rect.height +  CardSections.ShapeStatsBox.borderWidth;
	}

	static CollectCardInfo() {
		let cardTypeKey = infoCardType.options[infoCardType.selectedIndex].value;
		this.cardInfo = {
			type: cardTypeKey,
			typeObj: CardTypes[cardTypeKey],
			variant: infoCardTypeVariant.value,
			name: infoCardName.value,
			hp: infoCardHP.value,
			dmg: infoCardDMG.value,
			statuses: infoCardStatuses.value.split(/,| /).filter(x => !IsNullOrWhitespace(x)),
			desc: infoCardDesc.value,
			comment: infoCardComment.value,
		};
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

	static async RenderHTMLToCanvas(element, posX = 0, posY = 0) {
		if (IsNullOrWhitespace(element.innerHTML))
			return;

		console.log(element);
	
		let options = {
			logging: false,
			allowTaint: true,
			canvas: this.canvas,
			backgroundColor: null,
			x: -posX, // WHY IS IT NEGATIVE
			y: -posY,
			windowWidth: 4096,
			windowHeight: 4096
		};

		this.ctx.save();
		await html2canvas(element, options);
		this.ctx.restore();
	}

	static async LoadImage(src) {
		let img = new Image();
		img.src = src;

		try {
			await img.decode();
			return img;
		}
		catch (e) {
			console.error(e);
			return null;
		}
	}

	static async DrawImage(img, x, y, width = -1, height = -1) {
		if (typeof(img) == "string" || img instanceof String)
			img = await this.LoadImage(img);
		if (img == null)
			return;
		
		this.ctx.drawImage(img, x, y, width < 0 ? img.naturalWidth * CARD_SCALE : width, height < 0 ? img.naturalHeight * CARD_SCALE : height);
	}

	static DrawPath(path, fill = true, stroke = true) {
		//console.log(path)
		if (fill)
			this.ctx.fill(path);
		if (stroke)
			this.ctx.stroke(path);
	}

	static CreateRoundedRectPath(borderWidth, x, y, width, height, radii, existingPath) {
		if (borderWidth < 0)
			borderWidth = this.ctx.lineWidth;

		x += borderWidth/2;
		y += borderWidth/2;
		width -= borderWidth;
		height -= borderWidth;

		let path = existingPath == null ? new Path2D() : existingPath;
		path.roundRect(x, y, width, height, radii);
		return path;
	}

	static CreateCircleRoundedRectPath(borderWidth, x, y, width, height, cornerRadius, existingPath) {
		if (borderWidth < 0)
			borderWidth = this.ctx.lineWidth;

		x += borderWidth/2;
		y += borderWidth/2;
		width -= borderWidth;
		height -= borderWidth;

		// let negative radiuses bulge out
		let ccwise = cornerRadius > 0;
		cornerRadius = Math.abs(cornerRadius);

		let path = existingPath == null ? new Path2D() : existingPath;
		path.arc(x,         y,          cornerRadius, Math.PI/2,   0,          ccwise);
		path.arc(x + width, y,          cornerRadius, Math.PI,     Math.PI/2,  ccwise);
		path.arc(x + width, y + height, cornerRadius, Math.PI*1.5, Math.PI,    ccwise);
		path.arc(x,         y + height, cornerRadius, 0,           -Math.PI/2, ccwise);
		path.closePath();
		return path;
	}

	static CreateCrownPath(borderWidth, x, y, width, height, tipOffset, tipDepth, cantBottom, existingPath) {
		if (borderWidth < 0)
			borderWidth = this.ctx.lineWidth;

		x += borderWidth/2;
		y += borderWidth/2;
		width -= borderWidth;
		height -= borderWidth;

		let path = existingPath == null ? new Path2D() : existingPath;

		let shapeRect = new DOMRect(x, y, width, height);
		let center = shapeRect.relativeCenter();

		// top of crown
		path.moveTo(shapeRect.x, shapeRect.y);
		path.lineTo(shapeRect.x + center[0] - tipOffset, shapeRect.y + tipDepth);
		path.lineTo(shapeRect.x + center[0], shapeRect.y);
		path.lineTo(shapeRect.x + center[0] + tipOffset, shapeRect.y + tipDepth);
		path.lineTo(shapeRect.x + shapeRect.width, shapeRect.y);

		// bottom
		let offCant = Math.tan(cantBottom * (Math.PI/180)) * shapeRect.height;
		path.lineTo(shapeRect.x + shapeRect.width - offCant, shapeRect.y + shapeRect.height);
		path.lineTo(shapeRect.x + offCant, shapeRect.y + shapeRect.height);
		path.closePath();
		return path;
	}

	static CreateSpikedBoxPath(borderWidth, x, y, width, height, existingPath) {
		if (borderWidth < 0)
			borderWidth = this.ctx.lineWidth;

		x += borderWidth/2;
		y += borderWidth/2;
		width -= borderWidth;
		height -= borderWidth;

		let path = existingPath == null ? new Path2D() : existingPath;

		// divided by two, because we only need half of the height to get a right triangle
		let spikeWidth = height/2;

		path.moveTo(x + spikeWidth, y);
		path.lineTo(x + width - spikeWidth, y);
		path.lineTo(x + width, y + spikeWidth);
		path.lineTo(x + width - spikeWidth, y + height);
		path.lineTo(x + spikeWidth, y + height);
		path.lineTo(x, y + spikeWidth);
		path.closePath();
		return path;
	}

	// Takes in a cant in degrees for each side
	static CreateCantedBoxPath(borderWidth, x, y, width, height, cantLeft, cantRight, existingPath) {
		if (borderWidth < 0)
			borderWidth = this.ctx.lineWidth;

		x += borderWidth/2;
		y += borderWidth/2;
		width -= borderWidth;
		height -= borderWidth;

		let path = existingPath == null ? new Path2D() : existingPath;

		// soh cah toa baby
		let offLeft = Math.tan(cantLeft * (Math.PI/180)) * height;
		let offRight = Math.tan(cantRight * (Math.PI/180)) * height;

		path.moveTo(x + Math.max(0, offLeft), y);
		path.lineTo(x + width + Math.min(0, offRight), y);
		path.lineTo(x + width - Math.max(0, offRight), y + height);
		path.lineTo(x - Math.min(0, offLeft), y + height);

		path.closePath();
		return path;
	}

	static async DrawBackground(imgBackground, fill = true, stroke = true) {
		let box = CardSections.Background;
		let boxRect = box.rect;
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorCardBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorType;
		this.ctx.lineWidth = box.borderWidth;
		
		let path = new Path2D();
		this.ctx.beginPath();
		this.CreateRoundedRectPath(-1, boxRect.x, boxRect.y, boxRect.width, boxRect.height, 27 * CARD_SCALE, path);
		if (fill)
			this.ctx.fill(path);
		if (imgBackground != null) {
			this.ctx.save();
			this.ctx.clip(path);
			await this.DrawImage(imgBackground, 0, 0);
			this.ctx.restore();
		}
		if (stroke)
			this.ctx.stroke(path);
	}

	static async DrawIcon(icon) {
		if (icon == null)
			return;
		
		await this.DrawImage(icon, 0, 0);
	}

	static DrawTypeShape() {
		let shapeType = CardSections.ShapeType;
		let shapeRect = shapeType.rect;

		this.ctx.strokeStyle = this.cardInfo.typeObj.colorShapeBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorShapeFill;
		this.ctx.lineWidth = shapeType.borderWidth;
		
		// https://developer.mozilla.org/en-US/docs/Web/API/Path2D
		let path = new Path2D();
		this.ctx.beginPath();
		
		switch (this.cardInfo.type) {
			case "Basic": {
				// smaller box
				this.CreateRoundedRectPath(-1, shapeRect.x, shapeRect.y, shapeRect.width, shapeRect.height, 8 * CARD_SCALE, path);
				break;
			}
			case "Skilled": {
				// rounded profile box
				const cornerRadius = 20 * CARD_SCALE;
				this.CreateCircleRoundedRectPath(-1, shapeRect.x, shapeRect.y, shapeRect.width, shapeRect.height, cornerRadius, path);
				break;
			}
			case "Champion": {
				// crown shaped
				const crownTipOffset = shapeRect.width/5;
				const crownTipDepth = 10 * CARD_SCALE;
				const crownCant = 15;
				this.CreateCrownPath(-1, shapeRect.x, shapeRect.y, shapeRect.width, shapeRect.height, crownTipOffset, crownTipDepth, crownCant, path);
				break;
			}
			case "Environment": {
				// canted box
				const cant = -15;
				this.CreateCantedBoxPath(-1, shapeRect.x, shapeRect.y, shapeRect.width, shapeRect.height, -cant, cant, path);
				break;
			}
			case "Explore": {
				// spiked box (ala Xenoblade 2)
				this.CreateSpikedBoxPath(-1, shapeRect.x, shapeRect.y, shapeRect.width, shapeRect.height, path);
				
				if (!IsNullOrWhitespace(this.cardInfo.variant)) {
					shapeRect = CardSections.ShapeTypeVariant.rect;
					this.CreateRoundedRectPath(-1, shapeRect.x, shapeRect.y, shapeRect.width, shapeRect.height, 8 * CARD_SCALE, path);
				}
				break;
			}
		}

		this.ctx.fill(path);
		this.ctx.stroke(path);
	}

	static DrawDescriptionBox() {
		let box = CardSections.ShapeDescriptionBox;
		let boxRect = box.rect;
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorShapeBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorShapeFill;
		this.ctx.lineWidth = box.borderWidth;
		
		let path = new Path2D();
		this.ctx.beginPath();
		this.CreateRoundedRectPath(-1, boxRect.x, boxRect.y, boxRect.width, boxRect.height, 8 * CARD_SCALE, path);
		this.ctx.fill(path);
		this.ctx.stroke(path);
	}

	static async DrawStats() {
		let box = CardSections.ShapeStatsBox;
		let boxRect = box.rect;
		this.ctx.strokeStyle = this.cardInfo.typeObj.colorShapeBorder;
		this.ctx.fillStyle = this.cardInfo.typeObj.colorShapeFill;
		this.ctx.lineWidth = box.borderWidth;
		
		let path = new Path2D();
		this.ctx.beginPath();
		this.CreateRoundedRectPath(-1, boxRect.x, boxRect.y, boxRect.width, boxRect.height, 8 * CARD_SCALE, path);
		this.ctx.fill(path);
		this.ctx.stroke(path);

		// draw images
		let HP = await this.LoadImage("../Icons/HP.png");
		let DMG = await this.LoadImage("../Icons/DMG.png");

		let boxInternalHeight = boxRect.height - (box.borderWidth*2);
		let padding = 2 * CARD_SCALE;

		let rectHP = new DOMRect(0, 0, HP.naturalWidth, HP.naturalHeight).scale(boxInternalHeight/HP.naturalHeight);
		rectHP.x += padding;
		rectHP.y += padding;
		rectHP.width -= (padding*2);
		rectHP.height -= (padding*2);
		let rectDMG = new DOMRect(0, 0, DMG.naturalWidth, DMG.naturalHeight).scale(boxInternalHeight/DMG.naturalHeight);
		rectDMG.x += padding;
		rectDMG.y += padding;
		rectDMG.width -= (padding*2);
		rectDMG.height -= (padding*2);

		this.DrawImage(HP, boxRect.x + box.borderWidth + rectHP.x, boxRect.y + box.borderWidth + rectHP.y, rectHP.width, rectHP.height);
		this.DrawImage(DMG, boxRect.x + boxRect.width - box.borderWidth - rectDMG.x - rectDMG.width, boxRect.y + box.borderWidth + rectDMG.y, rectDMG.width, rectDMG.height);

		// statuses
		let statusesRect = renderCardStatuses.getBoundingClientRect();
		await this.RenderHTMLToCanvas(renderCardStatuses, boxRect.x + (boxRect.width/2) - (statusesRect.width/2), boxRect.y + (boxRect.height/2) - (statusesRect.height/2));
	}

	static async DrawText() {
		async function RenderTextCenteredAtBox(renderTextElem, cardSection, xNudge = 0, yNudge = 0, xCenter = true, yCenter = true) {
			let rectText = renderTextElem.getBoundingClientRect();
			let rectSection = cardSection.rect;
			//console.debug(rectText, rectSection);
			let vector = rectSection.relativeCenter(true).subtract(rectText.relativeCenter(true));
			//console.debug(vector);

			let xOff = rectSection.x + xNudge + (xCenter ? vector[0] : 0);
			let yOff = rectSection.y + yNudge + (yCenter ? vector[1] : 0);
			
			//console.log("Putting", renderTextElem, "at", xOff, yOff);
			await CardGen.RenderHTMLToCanvas(renderTextElem, xOff, yOff);
		}

		// title
		RenderTextCenteredAtBox(renderCardName, CardSections.ShapeType, 0 * CARD_SCALE, 0 * CARD_SCALE);
		if (this.cardInfo.type == "Explore")
			RenderTextCenteredAtBox(renderCardTypeVariant, CardSections.ShapeTypeVariant, 0 * CARD_SCALE, -1 * CARD_SCALE);

		// stats
		let rectStatsBox = CardSections.ShapeStatsBox.rect;
		let rectCardHP = renderCardHP.getBoundingClientRect();
		let rectCardDMG = renderCardDMG.getBoundingClientRect();
		let padding = 2 * CARD_SCALE
		RenderTextCenteredAtBox(renderCardHP, CardSections.ShapeStatsBox, rectStatsBox.height/2 - rectCardHP.width/2 + padding, 0 * CARD_SCALE, false, true);
		RenderTextCenteredAtBox(renderCardDMG, CardSections.ShapeStatsBox, rectStatsBox.width - rectStatsBox.height/2 - rectCardDMG.width/2 - padding, 0 * CARD_SCALE, false, true);

		// desc
		RenderTextCenteredAtBox(renderCardDesc, CardSections.ShapeDescriptionBox, 0 * CARD_SCALE, 7 * CARD_SCALE, true, false);

		// comment
		let rectCardComment = renderCardComment.getBoundingClientRect();
		let rectDescriptionBox = CardSections.ShapeDescriptionBox.rect;
		RenderTextCenteredAtBox(renderCardComment, CardSections.ShapeDescriptionBox, 0 * CARD_SCALE, rectDescriptionBox.height - rectCardComment.height - CardSections.ShapeDescriptionBox.borderWidth, true, false);
	}

	static async DrawCard() {
		this.ctx.clearRect(0,0,CARD_WIDTH,CARD_HEIGHT);

		// If you remove this you're gay. *Enter Sandman*
		let watermark = await this.LoadImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHBAMAAAA2fErgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURQBHq////9VghYAAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVBjTFclBEQAwEIQw1gH4N9vrMxMWYkFTss95cXTxABb/AU81y+VHAAAAAElFTkSuQmCC");
		await this.DrawImage(watermark, 0, 0);

		await this.ApplyToTemporaryRender();

		await this.DrawBackground("../Characters/Mizuki Date.png");
		await this.DrawIcon();
		await this.DrawTypeShape();
		await this.DrawDescriptionBox();
		await this.DrawStats();
		await this.DrawText();
	}

	static async ApplyToTemporaryRender() {
		let desc = this.cardInfo.desc;
		if (optionAutoHighlightDesc.checked)
			desc = this.HighlightReplacer(desc);
		desc = desc.replaceAll("\n", "<br>");
		
		// intentional innerHTML!
		renderCardTypeVariant.innerHTML = this.cardInfo.variant.replaceAll("\n", "<br>");
		renderCardName.innerHTML = this.cardInfo.name.replaceAll("\n", "<br>");
		renderCardHP.innerHTML = this.cardInfo.hp;
		renderCardDMG.innerHTML = this.cardInfo.dmg;
		renderCardDesc.innerHTML = desc;
		renderCardComment.innerHTML = this.cardInfo.comment.replaceAll("\n", "<br>");

		renderCardStatuses.innerHTML = "";
		for (let x of this.cardInfo.statuses) {
			renderCardStatuses.appendChild(await this.LoadImage(`../Icons/Statuses/${x}.png`));
		}
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	CardGen.Initialize();
});