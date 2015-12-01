$(document).ready(function() {
    function Segment(x, y, angle, length, size, color) {
        var radians = angle * (Math.PI / 180);
        this.startX = x;
        this.startY = y;

        this.endX = x + length * Math.cos(radians);
        this.endY = y + length * Math.sin(radians);
        
        this.nsX = x + (length - (size / 2)) * Math.cos(radians);
        this.nsY = y + (length - (size / 2)) * Math.sin(radians);
        this.length = length;
        this.angle = angle;
        this.size = size;
        this.color = color;
    }

    Segment.prototype = {
        constructor: Segment,
        render: function (context) {
            context.beginPath();
            context.moveTo(this.startX, this.startY);
            context.lineTo(this.endX, this.endY);
            context.lineWidth = this.size;
            context.strokeStyle = this.color;
            context.stroke();
            context.closePath();
        }
    };
    
    function Tree(x, y, size, gens) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.gens = gens;
        this.bark = 'rgb(30, 30, 30)';
        this.foliage1 = 'rgb(' + ~~(Math.random() * 7 + 10) + ',' + ~~(Math.random() * 7 + 10) + ',' + ~~(Math.random() * 7 + 10) + ')';
        this.foliage2 = 'rgb(' + ~~(Math.random() * 7 + 20) + ',' + ~~(Math.random() * 7 + 20) + ',' + ~~(Math.random() * 7 + 20) + ')';
        this.trunk = new Segment(x, y, -90, size, size / 9.5, this.bark);
    }

    Tree.prototype = {
        constructor: Tree,
        grow: function (context) {
            this.trunk.render(context);
            this.branch(this.trunk, this.gens, context);
        },
        branch: function (previous, gen, context) {
            var mod = (this.gens - gen);
            
            if (--gen < 0) {
                this.foliage(previous, context);
                return;
            }
            
            if (mod > 1 && Math.random() > 0.5) {
                this.branch(previous, gen - 1, context);
            }
            
            var len = ~~ (Math.random() * 2 + 3) + mod, angleMod = (mod + 1) * 35;
            
            while (len--) {
                var newAngle = ~~ (previous.angle + (Math.random() * angleMod * 2 - angleMod));
                var newLength = ~~ ((previous.length - mod) * (Math.random() * 0.4 + 0.5));
                var newSize = (previous.size * previous.length) / 100 + .5;
                var seg = new Segment(previous.nsX, previous.nsY, newAngle, newLength, newSize, previous.color);
                seg.render(context);
                this.branch(seg, gen, context);
            }
        },
        foliage: function (seg, context) {
            context.beginPath();
            context.rect(seg.endX, seg.endY, 2, 1);
            context.fillStyle = Math.random() > 0.5 ? this.foliage1 : this.foliage2;
            context.fill();
            context.closePath();
        }
    };

    function midpoint(p1, p2, max, jitter, points) {
        var mid = Math.round((p1 + p2) / 2);

        if (p2 - p1 <= 1 || p1 === mid || p2 === mid)
            return;
        
        var d = ((points[p1] + points[p2]) / 2) + (max * (Math.random() * (jitter * 2) - jitter));
        points[mid] = d;
        
        midpoint(p1, mid, (max / 2), jitter, points);
        midpoint(mid, p2, (max / 2), jitter, points);
    }

    function generatePoints() {
        points = [];
        
        for (var i = 0; i <= num_points; i++)
            points[i] = height - 75;

        midpoint(0, num_points, 75, 1, points);
    }

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var tcanvas = document.createElement('canvas');
    var tcontext = tcanvas.getContext('2d');
    var height, width, num_points, points;
    
    setTimeout(init, 100);

    function init() {
        height = tcanvas.height = canvas.height = document.body.offsetHeight;
        width = tcanvas.width = canvas.width = document.body.offsetWidth;
        num_points = ~~ (width / 4);
        context.clearRect(0, 0, width, height);
        tcontext.clearRect(0, 0, width, height);
        generatePoints();
        context.beginPath();
        context.moveTo(0, points[0]);
        
        var i = 0;
        var scale_x = (width / num_points);
        
        for (; i < points.length - 1; i += 2) {
            if (Math.random() > 0.5) {
                context.quadraticCurveTo(i * scale_x, points[i], (i + 1) * scale_x, points[i + 1]);
            }
            else {
                context.lineTo(i * scale_x, points[i]);
                context.lineTo((i + 1) * scale_x, points[i + 1]);
            }
            
            if (Math.random() < 0.5) {
                var tree = new Tree((i + 0.8) * scale_x, (points[i] + points[i + 1]) / 2, Math.random() * 10 + 12, 4);
                tree.grow(tcontext);
            }
        }

        context.lineTo(width, points[0]);
        context.lineTo(width, height);
        context.lineTo(0, height);
        //context.fillStyle = 'rgb(34, 43, 58)';
        context.fillStyle = 'rgb(24, 23, 28)';
        context.fill();
        context.closePath();
        
        context.drawImage(tcanvas, 0, 0);
    }
});