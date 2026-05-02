import St from 'gi://St';
import cairo from 'cairo';

export class SpeedGraph {
    constructor() {
        this.historySize = 50;
        this.history = new Array(this.historySize).fill(0);
        this.maxSpeed = 1;

        this.widget = new St.DrawingArea({
            width: 150,
            height: 80,
            style: 'margin-left: 15px;', 
            y_expand: true,
            y_align: 2 
        });
        
        this.widget.connect('repaint', this._drawGraph.bind(this));
    }

    getWidget() {
        return this.widget;
    }

    addPoint(speed) {
        this.history.push(speed);
        if (this.history.length > this.historySize) {
            this.history.shift();
        }
        
        this.maxSpeed = Math.max(...this.history, 10); 
        this.widget.queue_repaint();
    }

    _drawGraph(area) {
        let cr = area.get_context();
        let [width, height] = area.get_surface_size();

        cr.setOperator(cairo.Operator.CLEAR);
        cr.paint();
        cr.setOperator(cairo.Operator.OVER);

        cr.setLineWidth(1.0);
        cr.setSourceRGBA(1.0, 1.0, 1.0, 0.1); 

        cr.moveTo(0, height / 2);
        cr.lineTo(width, height / 2);
        cr.stroke();

        cr.moveTo(0, height * 0.1);
        cr.lineTo(width, height * 0.1);
        cr.stroke();

        cr.moveTo(0, height - 1); 
        cr.lineTo(width, height - 1);
        cr.stroke();

        cr.setLineWidth(2.0);
        cr.setSourceRGBA(0.2, 0.6, 1.0, 1.0); 

        let stepX = width / (this.historySize - 1);

        cr.moveTo(0, height - (this.history[0] / this.maxSpeed) * height);

        for (let i = 1; i < this.history.length; i++) {
            let x = i * stepX;
            let y = height - (this.history[i] / this.maxSpeed) * height; 
            cr.lineTo(x, y);
        }
        
        cr.stroke();
    }
}