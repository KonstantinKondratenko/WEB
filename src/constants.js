
export const WIDTH = 10; // ширина поля
export const HEIGHT = 20; // высота поля
export const CELL_SIZE = 40; // размер клетки в px

export const FPS = 100000; // frame rate чем больше, тем больше кадров в единицу времени
export const RECORDS_HTML = './end.html'; // последння страница
export const RECORDS_SIZE = 5; // размер таблицы рекордов

export const colors = 
{
    'Z': '#b22349', // every
    'L': '#7d4a14', // hunter
    'O': '#faff00', // want
    'S': '#18a810', // know
    'I': '#00a2ff', // where
    'J': '#2505d8', // sit
    'T': '#5b1193'  // pheasant
};

export const tetrominos = 
{
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],

    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],

    'O': [
        [1,1],
        [1,1],
    ],

    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],

    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],

    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],    
    
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};