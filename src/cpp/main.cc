#include "raylib.h"

int main() {
  const int screenWidth = 800;
  const int screenHeight = 800;
  InitWindow(screenWidth, screenHeight, "raylib [core] - basic window");

  SetTargetFPS(60);  

  while (!WindowShouldClose()) {  
    BeginDrawing();
    ClearBackground(RAYWHITE);
    DrawText("Congrats! You created your first raylib window!", 190, 200, 20,
             LIGHTGRAY);
    EndDrawing();
  }

  CloseWindow();

  return 0;
}