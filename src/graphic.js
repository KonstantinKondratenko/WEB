import { WIDTH, HEIGHT, CELL_SIZE } from "./constants.js";


class Cell 
{
    constructor(x, y, fill=0, color="#080104")
    {
        this.x = x; // х - позиция
        this.y = y; // у - позиция
        this.color = color; // цвет незанятой
        this.fill = fill; // флаг заполненности ячейка
    }
}

export class Visualisation // класс визуализации
{
    constructor(canvas_id, object_to_draw, cell_size = CELL_SIZE)
    {
        this.canvas_elem = document.getElementById(canvas_id); // id
        this.object_to_draw = object_to_draw; // объект отрисовки
        this.cell_size = cell_size; // размер ячейки        
        // размер конваса
        this.canvas_elem.width = this.canvas_width = this.object_to_draw.width * this.cell_size;
        this.canvas_elem.height = this.canvas_height =  this.object_to_draw.height * this.cell_size;
        this.canvas_elem.style.width = `${this.canvas_elem.width}px`;
        this.canvas_elem.style.height = `${this.canvas_elem.height}px`;
    }

    draw_playground() // отрисовка поля
    {
        if (this.canvas_elem.getContext)
        {
            let context = this.canvas_elem.getContext('2d');
            //очистка предыдущего шага
            context.clearRect(0, 0, this.canvas_width, this.canvas_height);
            //отрисовка игрового простарнства
            for (const row of this.object_to_draw.map)
            {
                for (const point of row) // вложенный цилк итерации по двумерной матрице -- строкам и ячейкам в строке 
                {
                    context.beginPath();                    
                    let x = point.x * this.cell_size;
                    let y = point.y * this.cell_size;
                    context.strokeStyle = "#0fb7e5"; // цвет линии разделения ячеек
                    context.lineWidth = 3; // толщина линии
                    context.strokeRect(x, y, this.cell_size, this.cell_size);
                    context.fillStyle = point.color;
                    context.fillRect(x, y, this.cell_size, this.cell_size);
                    context.closePath();
                }
            }
        }
    }
    
    draw_tetromino(color, tetromino) // отрисовка фигур
    {
        if (this.canvas_elem.getContext)
        {
            let context = this.canvas_elem.getContext('2d');
            context.fillStyle = color;
            for (let row = 0; row < tetromino.matrix.length; row++)
            {
                for (let column = 0; column < tetromino.matrix[row].length; column++)
                {
                    if (tetromino.matrix[row][column])
                    {
                        context.beginPath();                        
                        let x = (tetromino.column + column) * this.cell_size;
                        let y = (tetromino.row + row) * this.cell_size;
                        if (y >= 0)
                        {
                        context.fillRect(x, y, this.cell_size, this.cell_size);
                        context.closePath();
                        }
                    }
                }
            }
        }
    }
    
}


export class Field 
{
    constructor(width = WIDTH, height = HEIGHT)
    {
        this.width = width;
        this.height = height;
        this.map = []
        this.#create_map();
    }

    #create_map()
    {
        let map = []
        for (var row = -2; row < this.height; row++)
        {
            map[row] = []
            for (var column = 0; column < this.width; column++)
            {
                map[row][column] = new Cell(column,row);
            }
        }
        this.map = map;
    }
}