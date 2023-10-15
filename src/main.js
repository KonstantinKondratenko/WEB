import { Field, Visualisation } from "./graphic.js";
import {FPS, colors, tetrominos, RECORDS_HTML} from "./constants.js"; 
import {GameStorage} from "./storage.js"


class Game_logic 
{
    constructor() 
    {
        this.game_storage = new GameStorage(); // score table

        this.score = 0; // счет инициализации
        this.score_elem = document.getElementById("score") 
        this.level = 1; // уровень инициализацияя
        this.level_elem = document.getElementById("level")
        this.last_time_drop = performance.now(); // время последнего падения фигуры
        this.game_over = false; // флаг состояния
        this.playground_map = new Field(); // создание игровой матрицы
        this.playground_draw = new Visualisation("playground", this.playground_map); // создания объекта класса отрисовки
        this.playground_draw.draw_playground(); // отрисовка поля
        this.figure_preview_map = new Field(4, 4); // создание превью матрицы
        this.figure_preview_draw = new Visualisation("figure_preview", this.figure_preview_map); // создание объекта класса отрисовки превью
        this.figure_preview_draw.draw_playground(); // отрисовка превью
        this.tetromino_sequence = []; //
        this.current_tetromino = this.get_next_tetromino(); //
        this.interrupt_keyboard(); //
    }

    get_seed(min, max) 
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generate_sequence() 
    {
        const sequence =  Object.keys(tetrominos);

        while (sequence.length) 
        {
            const rand = this.get_seed(0, sequence.length - 1);
            const name = sequence.splice(rand, 1)[0];
            this.tetromino_sequence.push(name);
        }
    }

    get_next_tetromino() 
    {
        // генерация текущей фигуры
        if (this.tetromino_sequence.length === 0) 
        {
            this.generate_sequence();
        }
        // экстракция текущей фигуры
        const name = this.tetromino_sequence.pop();
        // генерация следующей фигуры
        if (this.tetromino_sequence.length === 0)
        {
            this.generate_sequence();
        }
        // следующая фигура
        const preview_name = this.tetromino_sequence.at(-1);
        const preview_matrix = tetrominos[preview_name];
        this.preview_tetromino(preview_name, preview_matrix);
        const tetromino_matrix = tetrominos[name];
        // центрирование по ширине фигуры
        const column = this.playground_map.width / 2 - Math.ceil(tetromino_matrix[0].length / 2);
        // инициализация y позиции -- для i смещение 1, а не 2, т.к. на боку они самая тонкая == 1, а остальные на боку 2 
        const row = -2;
        if (name === 'I')
        {
            const row = -1;
        }
        return {
            name: name,      // название фигуры
            matrix: tetromino_matrix,  // матрица с фигурой
            row: row,        // текущая строка
            column: column   // текущий столбец
        };
    }

    preview_tetromino(name, matrix) 
    {
        // отчищаем старую фигуру 
        this.figure_preview_draw.draw_playground();
        const color = colors[name];
        this.figure_preview_draw.draw_tetromino(color,
        {
            name: name,
            matrix: matrix,
            row: 0,
            column: 0
        }                                            )
    }

    right_rotate(matrix) 
    { 
        const N = matrix.length - 1;
        const result = matrix.map((row, i) => row.map((val, j) => matrix[N-j][i]));
        return result;
    }

    valid_action(matrix, new_row, new_column) 
    {
        for (let row = 0; row < matrix.length; row++) 
        {
            for (let column = 0; column < matrix[row].length; column++)
            {
                if (matrix[row][column] && 
                    (
                        new_column + column < 0 ||
                        new_column + column >= this.playground_map.width ||
                        new_row + row >= this.playground_map.height ||
                        this.playground_map.map[new_row + row][new_column + column].fill
                    ) 
                   )
                {
                    return false;
                }
            }
        }
        return true;
    }

    fix_tetromino() 
    {
        for (let row = 0; row < this.current_tetromino.matrix.length; row++)
        {
            for (let column = 0; column < this.current_tetromino.matrix[row].length; column++)
            {
                if (this.current_tetromino.matrix[row][column])
                {
                    if (this.current_tetromino.row + row < 0) // kонец игры
                    {
                        this.game_over = true;
                        console.log("game over");
                        this.game_storage.set_item(this.score);
                        window.location.href = RECORDS_HTML;
                        return;
                    }
                    // игра продолжается - заполняем информацию о новой фигуре
                    this.playground_map.map[this.current_tetromino.row + row][this.current_tetromino.column + column].color = colors[this.current_tetromino.name];
                    this.playground_map.map[this.current_tetromino.row + row][this.current_tetromino.column + column].fill = 1;
                }
            }
        }
        this.score += 10;

        //проверяем, что ряды очистились
        for (let row = this.playground_map.height - 1; row >= 0; )
        {
            if (this.playground_map.map[row].every(cell => cell.fill == 1))
            {
                this.level += 1;
                this.score += 80;

                for (let r = row; r >= 0; r--)
                {
                    for (let c = 0; c < this.playground_map.width; c++)
                    {
                        this.playground_map.map[r][c].fill = this.playground_map.map[r-1][c].fill;
                        this.playground_map.map[r][c].color = this.playground_map.map[r-1][c].color;
                    }
                }
            }
            else
            {
                row--;
            }
        }

        this.score_elem.textContent = new Intl.NumberFormat("ru-RU").format(this.score)
        this.level_elem.textContent = this.level

        this.current_tetromino = this.get_next_tetromino();
    }

    
    // обработчик кливиатурных прерываний
    interrupt_keyboard() {
        document.addEventListener('keydown', (event) => {
            if (this.game_over)
            {
                return;
            }
            const key_name = event.key;
            if (key_name === 'ArrowLeft' || key_name == 'ArrowRight')
            {
                let new_column = 0;                
                if (key_name == 'ArrowLeft')
                {
                    new_column = this.current_tetromino.column - 1; // если все-таки влево то отменяем движение вправо (первое -1, потом еще все-так в лево едем, потому еще раз -1, итого -2)
                }
                else
                {
                    new_column = this.current_tetromino.column + 1; // двигаемся вправо
                }
                
                if (this.valid_action( this.current_tetromino.matrix,  this.current_tetromino.row, new_column))
                {
                    this.current_tetromino.column = new_column;
                }
            }

            if (key_name === 'ArrowUp') // по часовой стрелке
            { 
                const new_matrix = this.right_rotate(this.current_tetromino.matrix);
                if (this.valid_action(new_matrix, this.current_tetromino.row, this.current_tetromino.column))
                {
                    this.current_tetromino.matrix = new_matrix;
                }
            }
            
            // if (key_name === 'ArrowUp') // против часовой стрелке
            // { 
            //     let new_matrix = this.right_rotate(this.current_tetromino.matrix);
            //     new_matrix = this.right_rotate(new_matrix);
            //     new_matrix = this.right_rotate(new_matrix);
            //     if (this.valid_action(new_matrix, this.current_tetromino.row, this.current_tetromino.column))
            //     {
            //         this.current_tetromino.matrix = new_matrix;
            //     }
            // }


            if (key_name === 'ArrowDown')
            {
                const new_row = this.current_tetromino.row + 1;
                if (!this.valid_action( this.current_tetromino.matrix, new_row, this.current_tetromino.column))
                {
                    this.current_tetromino.row = new_row - 1;
                    this.fix_tetromino();
                    return;
                }
                this.current_tetromino.row = new_row;
            }
        }               )
    }

    run() 
    {
        if (!this.game_over)
        {
            requestAnimationFrame(this.run.bind(this));
            this.playground_draw.draw_playground(); // отрисовка 
            if (this.current_tetromino)
            {
                let speed = FPS / (300 + this.level * 150);
                if (speed < 50) // ограничение максимальной скорости
                {
                    speed = 50;
                }
                const delta_time = performance.now() - this.last_time_drop;
                if (delta_time > speed)
                {
                    this.current_tetromino.row++; // опускаем фигуру на 1 клетку
                    if (!this.valid_action(this.current_tetromino.matrix, this.current_tetromino.row, this.current_tetromino.column))
                    {
                        this.current_tetromino.row--; // если не опустилась, то возвращаем
                        this.fix_tetromino(); // фиксируем
                    }
                    this.last_time_drop = performance.now(); // обновляем время
                }
            const color = colors[this.current_tetromino.name];
            this.playground_draw.draw_tetromino(color, this.current_tetromino); // отрисовка
            }
        }        
        return;
    }
}


let session = new Game_logic();
session.run();