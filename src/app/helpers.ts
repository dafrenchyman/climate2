/**
 * Created by dafre on 5/11/2017.
 */

//import * as glMatrix from 'gl-matrix';
import {GlMatrix} from "./GlMatrix";
import {Settings} from "./settings";

export class Helpers {

  public static LeftPad(num:number, size:number): string {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }


  public static CelsiusToFahrenheit (celsius : number) {
    return celsius*(9/5) + 32;
  }

  public static FahrenheitToCelsius (fahrenheit : number) {
    return (fahrenheit - 32)*(5/9);
  }

  public static KelvinToCelsius(kelvin : number) {
    return (kelvin - 273.15);
  }

  /***
   * Degree to Radian
   * @param degrees
   * @returns {number}
   */
  public static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  public static cartesianToSphere(lonInRad, latInRad, radius) {
    var theta = lonInRad;
    var phi = latInRad;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);

    // Normals
    var x = cosPhi * cosTheta;
    var y = cosPhi * sinTheta;
    var z = sinPhi;

    // Tangent
    var tanRotMatrix = GlMatrix.mat4.create();
    var normal = GlMatrix.vec3.create();
    var tangent = GlMatrix.vec3.create();
    normal[0] = x;
    normal[1] = y;
    normal[2] = z;
    GlMatrix.mat4.rotate(tanRotMatrix, tanRotMatrix, this.degToRad(90), [0, 0, 1]);
    GlMatrix.mat4.multiplyVec3(tangent, tanRotMatrix, normal);

    // BiTangent
    var biTangent = GlMatrix.vec3.create();
    var biTanRotMatrix = GlMatrix.mat4.create();
    GlMatrix.mat4.rotate(biTanRotMatrix, biTanRotMatrix, this.degToRad(-90), normal);
    GlMatrix.mat4.multiplyVec3(biTangent, biTanRotMatrix, tangent);

    var values = {
      coordinates: {x: radius * x, y: radius * y, z: radius * z},
      normals: {x: x, y: y, z: z},
      tangents: {x: tangent[0], y: tangent[1], z: tangent[2]},
      biTangents: {x: biTangent[0], y: biTangent[1], z: biTangent[2]}
    };

    return values;
  }

  padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
  }

  //or as a Number prototype method:
  /*Number.prototype.padLeft = function (n,str){
  return Array(n-String(this).length+1).join(str||'0')+this;
}*/


  ProcessRawDataValue(LayerSettings, rawValues) {
    var valueFinal = [];
    switch (LayerSettings.DataUnits) {
      case 'Kelvins':
      case 'degK':
        switch (LayerSettings.TemperatureType) {
          case 'C':
            for (var i = 0; i < rawValues.length; i++) {
              valueFinal.push(Helpers.KelvinToCelsius(rawValues[i]));
            }
            break;
          default :
            valueFinal = rawValues;
        }
        break;
      default :
        valueFinal = rawValues;
    }
    return(valueFinal);
  }

  cartesianToSphere(lonInRad, latInRad, radius) {
    var theta = lonInRad;
    var phi = latInRad;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);

    // Normals
    var x = cosPhi * cosTheta;
    var y = cosPhi * sinTheta;
    var z = sinPhi;

    // Tangent
    var tanRotMatrix = GlMatrix.mat4.create();
    var normal = GlMatrix.vec3.create();
    var tangent = GlMatrix.vec3.create();
    normal[0] = x;
    normal[1] = y;
    normal[2] = z;
    GlMatrix.mat4.rotate(tanRotMatrix, tanRotMatrix, Helpers.degToRad(90), [0, 0, 1]);
    GlMatrix.mat4.multiplyVec3(tangent, tanRotMatrix, normal);

    // BiTangent
    var biTangent = GlMatrix.vec3.create();
    var biTanRotMatrix = GlMatrix.mat4.create();
    GlMatrix.mat4.rotate(biTanRotMatrix, biTanRotMatrix, Helpers.degToRad(-90), normal);
    GlMatrix.mat4.multiplyVec3(biTangent, biTanRotMatrix, tangent);

    var values = {
      coordinates: {x: radius * x, y: radius * y, z: radius * z},
      normals: {x: x, y: y, z: z},
      tangents: {x: tangent[0], y: tangent[1], z: tangent[2]},
      biTangents: {x: biTangent[0], y: biTangent[1], z: biTangent[2]}
    };

    return values;
  }

  // Unproject the canvas (x,y) to coordinates in the "world." Z values is the depth into the world. You'll need to call this
  // function twice to get a "ray" in the world that is then usable.
  public static Unproject(winx, winy, winz, viewportWidth, viewPortHeight, pMatrix, vMatrix) {

    // This was a pain. Eventually found this site: http://trac.bookofhook.com/bookofhook/trac.cgi/wiki/MousePicking
    // and just went through the math piece by piece.

    // Clipping coordinates
    var n = GlMatrix.vec4.create();
    n[0] = (2*winx)/viewportWidth - 1.0;
    n[1] = -1*((2*winy)/viewPortHeight - 1.0);
    n[2] = 2.0*winz-1.0;
    n[3] = 1.0;

    // Viewspace Values
    var viewspaceMatrix = GlMatrix.mat4.create();
    GlMatrix.mat4.copy(viewspaceMatrix, pMatrix);
    GlMatrix.mat4.invert(viewspaceMatrix, viewspaceMatrix);

    // Clipping space to viewspace
    var viewspaceVector = GlMatrix.vec4.create();
    GlMatrix.mat4.multiply(viewspaceVector, viewspaceMatrix, n);

    viewspaceVector[0] = viewspaceVector[0]/viewspaceVector[3];
    viewspaceVector[1] = viewspaceVector[1]/viewspaceVector[3];
    viewspaceVector[2] = viewspaceVector[2]/viewspaceVector[3];
    viewspaceVector[3] = 1.0;

    // Viewspace to Modelspace
    var viewMatrix = GlMatrix.mat4.create();
    GlMatrix.mat4.copy(viewMatrix, vMatrix);
    GlMatrix.mat4.invert(viewMatrix, viewMatrix);

    var out = GlMatrix.vec4.create();
    GlMatrix.mat4.multiply(out, viewMatrix, viewspaceVector);
    return out;
  }

  //
  // From http://geomalgorithms.com/a06-_intersect-2.html
  public static TriangleIntersection(V0, V1, V2, P0, P1) {
    var  SMALL_NUM = 0.00000001;
    var returnValue = {
      intersects: false,
      point: null
    };

    var u = GlMatrix.vec3.create(), v = GlMatrix.vec3.create(), n = GlMatrix.vec3.create();              // triangle vectors
    var dir = GlMatrix.vec3.create(), w0 = GlMatrix.vec3.create(), w = GlMatrix.vec3.create();           // ray vectors
    var r, a, b;              // params to calc ray-plane intersect
    var I = GlMatrix.vec3.create();

    // get triangle edge vectors and plane normal
    GlMatrix.vec3.sub(u, V1, V0);
    GlMatrix.vec3.sub(v, V2, V0);
    GlMatrix.vec3.cross(n, u, v);              			// cross product
    if (n[0] == 0 && n[1] == 0 && n[2] == 0)    // triangle is degenerate
    {
      //return -1;							// do not deal with this case
      return returnValue;
    }

    GlMatrix.vec3.sub(dir, P1, P0);              		// ray direction vector
    GlMatrix.vec3.sub(w0, P0, V0);
    a = -1.0 * GlMatrix.vec3.dot(n,w0);
    b = GlMatrix.vec3.dot(n,dir);
    if (Math.abs(b) < SMALL_NUM) {     			// ray is  parallel to triangle plane
      if (a == 0)                 			// ray lies in triangle plane
      {
        //return 2;
        return returnValue;
      }
      else {
        //return 0;							// ray disjoint from plane
        return returnValue;
      }
    }

    // get intersect point of ray with triangle plane
    r = a / b;
    if (r < 0.0)                    // ray goes away from triangle
    {
      //return 0;					// => no intersect
      return returnValue;
    }
    // for a segment, also test if (r > 1.0) => no intersect

    var rvec = GlMatrix.vec3.create();
    rvec[0] = r;
    rvec[1] = r;
    rvec[2] = r;
    var I1 = GlMatrix.vec3.create();
    GlMatrix.vec3.multiply(I1, rvec, dir);
    GlMatrix.vec3.add(I, P0, I1);            // intersect point of ray and plane

    // is I inside T?
    var uu, uv, vv, wu, wv, D;
    uu = GlMatrix.vec3.dot(u,u);
    uv = GlMatrix.vec3.dot(u,v);
    vv = GlMatrix.vec3.dot(v,v);
    w = GlMatrix.vec3.sub(w, I, V0);
    wu = GlMatrix.vec3.dot(w,u);
    wv = GlMatrix.vec3.dot(w,v);
    D = uv * uv - uu * vv;

    // get and test parametric coords
    var s, t;
    s = (uv * wv - vv * wu) / D;
    if (s < 0.0 || s > 1.0) {         // I is outside T
      //return 0;
      return returnValue;
    }
    t = (uv * wu - uu * wv) / D;
    if (t < 0.0 || (s + t) > 1.0) {  // I is outside T
      //return 0;
      return returnValue;
    }
    returnValue.intersects = true;
    var out = GlMatrix.vec3.create();
    out = I;
    returnValue.point = out;

    //return 1;                       // I is in T
    return returnValue;
  }

  public static ArrayMax(input : number[]) {
    return Math.max.apply(null, input);
  };

  public static ProcessRawDataValue (rawValues, settings : Settings) {
  var valueFinal = [];
  switch (settings.DataUnits) {
    case 'Kelvins':
    case 'degK':
      switch (settings.TemperatureType) {
        case 'C':
          for (var i = 0; i < rawValues.length; i++) {
            valueFinal.push(Helpers.KelvinToCelsius(rawValues[i]));
          }
          break;
        default :
          valueFinal = rawValues;
      }
      break;
    default :
      valueFinal = rawValues;
  }
  return(valueFinal);
}


  public static ArrayMin(input : number[]){
    return Math.min.apply(null, input);
  };

  public static ArrayContains(v : any[], match: any) : boolean {
    for(var i = 0; i < v.length; i++) {
      if(v[i] === match) return true;
    }
    return false;
  };

  public static ArrayUnique(input: any[]) :any[] {
    var arr = [];
    for(var i = 0; i < input.length; i++) {
      if(!this.ArrayContains(arr, input[i])) {
        arr.push(input[i]);
      }
    }
    return arr;
  };

  public static StringReplaceAll = function(search, replacement, target) {
    return target.split(search).join(replacement);
  };


}
