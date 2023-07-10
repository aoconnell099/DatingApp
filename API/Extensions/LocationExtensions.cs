using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Extensions
{
    public class LocationExtensions
    {
        public static double distance(double lat1, double lon1, double lat2, double lon2) {
            if ((lat1 == lat2) && (lon1 == lon2)) {
                return 0;
            }
            else {
                double theta = lon1 - lon2;
                double dist = Math.Sin(deg2rad(lat1)) * Math.Sin(deg2rad(lat2)) + Math.Cos(deg2rad(lat1)) * Math.Cos(deg2rad(lat2)) * Math.Cos(deg2rad(theta));
                dist = Math.Acos(dist);
                dist = rad2deg(dist);
                dist = dist * 60 * 1.1515;
                return (dist);
            }
        }

        // Convert decimal degrees to radians
        public static double deg2rad(double deg) {
        return (deg * Math.PI / 180.0);
        }

        // Convert radians to decimal degrees
        public static double rad2deg(double rad) {
        return (rad / Math.PI * 180.0);
        }
    }
}