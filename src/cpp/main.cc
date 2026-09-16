#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "raylib.h"
using namespace std;
const int screen_width = 800;
const int screen_height = 800;

typedef struct {
  Vector3 v0, v1, v2;
} Triangle;

Vector2 project(const Vector3 v) {
  Vector2 v_out;
  v_out.x = v.x / (v.z);
  v_out.y = v.y / (v.z);
  return v_out;
}

Vector2 normalized_to_screen_space(Vector2 v) {
  float x = ((v.x + 1) / 2) * screen_width;
  float y = (((v.y * -1) + 1) / 2) * screen_height;
  Vector2 v_out;
  v_out.x = x;
  v_out.y = y;
  return v_out;
}
Vector3 translate(const Vector3 v, const Vector3 delta) {
  Vector3 v_out;
  v_out.x = v.x + delta.x;
  v_out.y = v.y + delta.y;
  v_out.z = v.z + delta.z;
  return v_out;
}
void draw_triangle(Vector2 v0, Vector2 v1, Vector2 v2) {
  DrawLine(v0.x, v0.y, v1.x, v1.y, BLACK);
  DrawLine(v2.x, v2.y, v1.x, v1.y, BLACK);
  DrawLine(v2.x, v2.y, v0.x, v0.y, BLACK);
}
Vector2 cook_vertex(Vector3 v) {
  v = translate(v, {0, -1.5, 5});
  Vector2 v_out;
  v_out = project(v);
  v_out = normalized_to_screen_space(v_out);
  return v_out;
}
int main() {
  fstream file("./data.txt");
  string line;

  if (!file.is_open()) {
    cerr << "Error: Could not open file n";
    return -1;
  }
  Vector3 v;
  vector<Vector3> current_vertices;
  vector<Triangle> triangles;
  while (getline(file, line)) {
    stringstream ss(line);
    if (ss >> v.x >> v.y >> v.z) {
      current_vertices.push_back(v);
    }
    if (current_vertices.size() == 3) {
      triangles.push_back(
          {current_vertices[0], current_vertices[1], current_vertices[2]});
      current_vertices.clear();
    }
    cout << line << endl;
  }

  InitWindow(screen_width, screen_height, "raylib [core] - basic window");

  SetTargetFPS(60);

  while (!WindowShouldClose()) {
    BeginDrawing();
    ClearBackground(RAYWHITE);
    DrawText("Congrats! You created your first raylib window!", 190, 200, 20,
             LIGHTGRAY);
    for (auto triangle : triangles) {
      draw_triangle(cook_vertex(triangle.v0), cook_vertex(triangle.v1),
                    cook_vertex(triangle.v2));
    }
    EndDrawing();
  }

  CloseWindow();

  return 0;
}