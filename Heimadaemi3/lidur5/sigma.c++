#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

struct Point {
    double x, y, z;


};

Point subtract(const Point& u, const Point& v){
    return Point{u.x - v.x, u.y - v.y, u.z - v.z};
}

Point crossProduct(const Point& u, const Point& v){
    return Point{
        u.y * v.z - u.z * v.y,
        u.z * v.x - u.x * v.z,
        u.x * v.y - u.y * v.x
    };

}

double dotProduct(const Point& u, const Point& v) {
    return u.x * v.x + u.y * v.y + u.z * v.z;
}

bool isCoplanar(const vector <Point>& points){

    Point AB = subtract(points[1], points[0]);
    Point AC = subtract(points[2], points[0]);

    Point normal = crossProduct(AB, AC);

    for (int i = 3; i < points.size(); i++){
        Point AD = subtract(points[i], points[0]);

        double dot = dotProduct(normal, AD);
        cout << dot << endl;
        if (fabs(dot) > 1e-9){
            
            cout << "VIRKADI EKKI!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1" << endl;
            return false;
        }
    }
    return true;



}








int main() {

    vector<Point> points = {
        {1, 2, 3},
        {4, 5, 6},
        {1, 0, 0},
        {1, 2, 3},
        {32,32,1}


    };

 
    if (isCoplanar(points)) {
        cout << "The points are coplanar." << endl;
    } else {
        cout << "The points are not coplanar." << endl;
    }

    return 0;

}