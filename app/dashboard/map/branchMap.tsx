"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Calendar,
  RotateCcw,
  Navigation,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { DialogHeader, DialogTitle } from "./ui/dialog";

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  services: string[];
  lat: number;
  lng: number;
  hours: string;
  bookingUrl?: string;
  city: string;
}

interface MapInstance {
  map: L.Map;
  markers: Map<string, L.Marker>;
  cluster?: unknown;
  popup?: L.Popup;
}

const branches: Branch[] = [
  // Hà Nội - 11 Chi Nhánh
  {
    id: 1,
    name: "Vincom Center Bà Triệu",
    address: "191 Bà Triệu, Quận Hai Bà Trưng, TP.Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.0115115637416,
    lng: 105.84976753261832,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 2,
    name: "Vinhomes Westpoint - W2 01S01",
    address: "Số 1 Đỗ Đức Dục, Quận Nam Từ Liêm, TP.Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.009100815022972,
    lng: 105.78533993606051,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 3,
    name: "Imperia Sky Garden - Toà C, Shophouse C07",
    address: "423 Minh Khai, Phường Vĩnh Tuy, Quận Hai Bà Trưng, TP Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 20.99931614749087,
    lng: 105.86606967732345,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 4,
    name: "Đảo Ngọc Ngũ Xã",
    address:
      "Tầng lửng Shophouse, số 58A Nam Tràng, Phường Trúc Bạch, Quận Ba Đình, TP Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.04545067069476,
    lng: 105.84063356727488,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 5,
    name: "Kosmo Tây Hồ",
    address:
      "Chung cư Newtatco, Shophouse S17, Kosmo Tây Hồ, Xuân La, Bắc Từ Liêm, Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.069855929300154,
    lng: 105.80145298935956,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 6,
    name: "Yên Hoa",
    address: "Số 46 Yên Hoa – Tây Hồ – Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.05120735974931,
    lng: 105.838411138439,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 7,
    name: "Vinhomes SkyLake",
    address:
      "L2-07, Tầng L2, Vincom Plaza Skylake, Khu đô thị mới Cầu Giấy, P Mỹ Đình 1, Quận Nam Từ Liêm",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.020254778195486,
    lng: 105.78095481727432,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 8,
    name: "Vincom Phạm Ngọc Thạch",
    address:
      "L4-04, Tầng 04, Vincom Center Phạm Ngọc Thạch, 02 Phạm Ngọc Thạch, P Kim Liên, Quận Đống Đa",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.006556720123594,
    lng: 105.83195263870053,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 9,
    name: "Face Wash Fox - Starlake",
    address:
      "Shophouse 903B - TM1 - 3, tầng 1, Tòa nhà 903, lô H9-CT1, Khu trung tâm Khu đô thị Tây Hồ Tây, Phường Xuân Đỉnh Hà Nội, Khu đô thị Tây Hồ Tây, Hanoi City, Hà Nội 100000",
    phone: "+84 889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.055969033039187,
    lng: 105.79235097721686,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 10,
    name: "Vinhome Green Bay - Đại Lộ Thăng Long",
    address:
      "Vinhomes Green Bay, Số 7 Đại Lộ Thăng Long, Phường Đại Mỗ, Thành phố Hà Nội",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.001157703852563,
    lng: 105.78279672494604,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },
  {
    id: 11,
    name: "Hanoi Tower",
    address:
      "Gian hàng số 21, Tầng Trệt, TTTM Hanoi Towers (Tháp Hà Nội), 49 Hai Bà Trưng, phường Cửa Nam, thành phố Hà Nội, Việt Nam",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 21.02611820139273,
    lng: 105.84580949073622,
    hours: "9:30 - 21:30",
    city: "Hà Nội",
  },

  // Hồ Chí Minh - 29 Chi Nhánh
  {
    id: 12,
    name: "Parc Mall",
    address:
      "Tầng G, Glam Beautique, Lô [COS-03], 547 - 549 Tạ Quang Bửu, P.4, Quận 8",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.741253608950561,
    lng: 106.67857342861501,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 13,
    name: "Vincom Center Landmark 81 - Lầu 3",
    address: "720A Điện Biên Phủ, Quận Bình Thạnh, TP.Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.795439029231291,
    lng: 106.72178170502013,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 14,
    name: "Vincom Mega Mall Thảo Điền - Lầu 3",
    address: "161 Võ Nguyên Giáp, Phường Thảo Điền, TP.Thủ Đức",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.802632518413802,
    lng: 106.74095013828043,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 15,
    name: "The Sun Avenue - SAV3",
    address: "28 Mai Chí Thọ, Phường An Phú, TP.Thủ Đức",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.785198631528988,
    lng: 106.74745001162732,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 16,
    name: "Vincom Plaza - Phan Văn Trị",
    address: "Lầu 3, 12 Phan Văn Trị, Phường 5, Quận Gò Vấp, TP.Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.827201035525615,
    lng: 106.6891071536249,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 17,
    name: "Vincom Plaza - Quang Trung",
    address: "Lầu 2, 190 Quang Trung, Phường 10, Quận Gò Vấp, TP.Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.829494495735004,
    lng: 106.67264283828062,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 18,
    name: "Vincom Plaza - Lê Văn Việt",
    address: "Lầu 3, 50 Lê Văn Việt, Phường Hiệp Phú, TP.Thủ Đức",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.845215045219076,
    lng: 106.77861459595306,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 19,
    name: "Vista Verde",
    address: "2 Phan Văn Đáng, Phường Thạnh Mỹ Lợi, TP.Thủ Đức",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.777170082958138,
    lng: 106.75751265680414,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 20,
    name: "Crescent Mall",
    address: "101 Tôn Dật Tiên, Phường Tân Phú, Quận 7, TP.Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.728788180472266,
    lng: 106.71875752478795,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 21,
    name: "Botanica - Phổ Quang",
    address: "104 Phổ Quang, Phường 2, Quận Tân Bình, TP.Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.808711090291043,
    lng: 106.67012015362474,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 22,
    name: "The Everrich Infinity",
    address: "290 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.761089933719187,
    lng: 106.68060883828005,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 23,
    name: "Hoa Lan - Phú Nhuận",
    address: "140 Hoa Lan, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.797869961311404,
    lng: 106.688768736428,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 24,
    name: "Võ Thị Sáu",
    address: "100 đường Võ Thị Sáu, Phường Tân Định, Quận 1",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.788585134216817,
    lng: 106.69223975362458,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 25,
    name: "MVillage - Trương Định",
    address:
      "14 Trương Định, Toà nhà M – Village, Phường 6, Quận 3, TP. Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.776886142014762,
    lng: 106.69119648060811,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 26,
    name: "AEON MALL TÂN PHÚ",
    address:
      "Tầng 2, Lô S14 TTTM Aeon Mall Celadon Tân Phú, Số 30 đường Tân Thắng, phường Sơn Kỳ, quận Tân Phú, TP. Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.80182428035194,
    lng: 106.61743256711645,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 27,
    name: "Riviera Point - Quận 7",
    address:
      "Toà 3, Đường số 2, Nguyễn Văn Tưởng, P. An Phú, Quận 7, TP. Hồ Chí Minh",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.732190577622115,
    lng: 106.72922162478802,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 28,
    name: "The Symphony - Midtown M6",
    address: "Tòa M6, Midtown Phú Mỹ Hưng, Đường 16, Tân Phú, Quận 7",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.723910760154066,
    lng: 106.72666683827975,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 29,
    name: "Estella Height - Thủ Đức",
    address: "Tầng 3, Estella Height, 88 Song Hành, An Phú, Thủ Đức",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.802108767472468,
    lng: 106.74929506077173,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 30,
    name: "SC VivoCity",
    address: "Tầng 2, SC VivoCity, 1058 Nguyễn Văn Linh, Tân Phong, Quận 7",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.730474537820713,
    lng: 106.7034082247881,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 31,
    name: "AEON MALL Bình Tân",
    address:
      "Tầng trệt, Aeon Mall Bình Tân, 1 Đ. Số 17A, Bình Trị Đông B, Bình Tân",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.742971046177313,
    lng: 106.61193089595203,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 32,
    name: "NOWZONE Fashion Mall",
    address:
      "TTTM Nowzone – Lầu 1-118, 235, Nguyễn Văn Cừ, P.Nguyễn Cư Trinh, Q.1, HCM",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.764384250609973,
    lng: 106.68252233828012,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 33,
    name: "Saigon Centre",
    address: "Tầng 6 – Số 65 Lê Lợi, P. Bến Nghé, Quận 1",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.774007102802113,
    lng: 106.70107292478845,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 34,
    name: "1B Sương Nguyệt Anh",
    address: "1B Sương Nguyệt Ánh, P. Bến Thành, Quận 1",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.773119763768271,
    lng: 106.69027192478833,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 35,
    name: "MVillage - Thi Sách",
    address: "Số 26 Thi Sách, P. Bến Nghé, Quận 1",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.77925725903514,
    lng: 106.70407649595244,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 36,
    name: "The Senator Building",
    address: "43A – 43B Xuân Thủy, P. Thảo Điền, Thủ Đức",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.803487601638913,
    lng: 106.73156009595256,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 37,
    name: "MVillage - Nguyễn Du",
    address: "149 - 151 Nguyễn Du, P. Bến Thành, Quận 1",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.773245083067525,
    lng: 106.69294779022876,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 38,
    name: "Vincom 3/2 - L4-03",
    address: "L4-03, 3C Đường 3/2, P. 10, Quận 10",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.77631244239704,
    lng: 106.68069656711633,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 39,
    name: "Face Wash Fox - Marina",
    address:
      "Tầng 2 - L2.03, 2 Tôn Đức Thắng, Phường Sài Gòn, Quận 1, Hồ Chí Minh 700000",
    phone: "+84 889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.785952155643384,
    lng: 106.70759799754397,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },
  {
    id: 40,
    name: "Lumiere",
    address: "275 Võ Nguyên Giáp, An Phú, Thủ Đức, Hồ Chí Minh 700000",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.803316082905022,
    lng: 106.74077718464842,
    hours: "9:30 - 21:30",
    city: "Hồ Chí Minh",
  },

  // Đà Nẵng - 1 Chi Nhánh
  {
    id: 41,
    name: "177 Trần Phú",
    address: "177 Trần Phú, P. Hải Châu, TP. Đà Nẵng",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 16.066648799732953,
    lng: 108.2238566960181,
    hours: "9:30 - 21:30",
    city: "Đà Nẵng",
  },

  // Vũng Tàu - 2 Chi Nhánh
  {
    id: 42,
    name: "Joi Boutique Bãi Trước",
    address: "Số 04 Thống Nhất, Phường 1, TP Vũng Tàu",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.345896186694704,
    lng: 107.07705076711247,
    hours: "9:30 - 21:30",
    city: "Vũng Tàu",
  },
  {
    id: 43,
    name: "Hạ Long - Vũng Tàu",
    address: "Số 136 Hạ Long, Phường 2, TP Vũng Tàu",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 10.340194172518181,
    lng: 107.07251275176809,
    hours: "9:30 - 21:30",
    city: "Vũng Tàu",
  },

  // Nha Trang - 1 Chi Nhánh
  {
    id: 44,
    name: "Gold Coast Nha Trang",
    address:
      "Tầng 04, Số 01 Trần Hưng Đạo, P. Lộc Thọ, TP Nha Trang, Khánh Hòa",
    phone: "0889 866 666",
    services: ["Tư vấn", "Rửa mặt", "Mỹ phẩm"],
    lat: 12.249104719976115,
    lng: 109.19479219157415,
    hours: "9:30 - 21:30",
    city: "Nha Trang",
  },
];

const cities = [
  "Tất cả",
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Vũng Tàu",
  "Nha Trang",
];
const branchTypes = ["Tất cả", "Chính", "Phụ"];
const serviceTypes = ["Tư vấn", "Rửa mặt", "Mỹ phẩm"];

export default function BranchMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const [selectedBranchType, setSelectedBranchType] = useState("Tất cả");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filteredBranches, setFilteredBranches] = useState(branches);
  const [showFilters] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showBranchDetails, setShowBranchDetails] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const L = await import("leaflet");

      // Check if container is already initialized
      if (
        (mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id
      ) {
        console.log("[v0] Map container already initialized, skipping");
        return;
      }

      // Double check that we don't have an existing map instance
      if (mapInstanceRef.current) {
        console.log("[v0] Map instance already exists, skipping");
        return;
      }

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(link);
      }

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/logo.png",
        iconUrl: "/logo.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        preferCanvas: true,
        zoomAnimation: true,
        fadeAnimation: true,
        center: [21.0285, 105.8542], // Hà Nội center
        zoom: 11,
        maxZoom: 19,
      });

      const addBaseLayer = () => {
        try {
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: "abcd",
              maxZoom: 19,
            }
          ).addTo(map);
        } catch {
          console.log("[v0] Primary tile layer failed, using fallback");
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);
        }
      };

      addBaseLayer();

      const popup = L.popup({
        closeButton: true,
        autoClose: false,
        closeOnEscapeKey: true,
      });

      map.on("movestart", () => setUserInteracted(true));
      map.on("zoomstart", () => setUserInteracted(true));

      mapInstanceRef.current = {
        map,
        markers: new Map(),
        popup,
      };

      setIsMapLoaded(true);
      setMapError(null);
      console.log("[v0] Map initialized successfully");

      // Trigger resize to ensure map fills container
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Additional resize trigger after a longer delay
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    } catch (error) {
      console.error("[v0] Failed to initialize map:", error);
      setMapError("Không thể tải bản đồ. Vui lòng thử lại.");
    }
  }, []);

  // Create custom fox icon function
  const createFoxIcon = useCallback((L: typeof import("leaflet")) => {
    return L.divIcon({
      html: `
        <div style="
          width: 30px; 
          height: 30px; 
        
          border: 3px solid orange; 
          border-radius: 50%; 
          
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        "> <img src="/logo.png" alt="Fox Logo" style="width: 30px; height: 30px; object-fit: contain;" /></div>
      `,
      className: "fox-marker",
      iconSize: [40, 40],
      iconAnchor: [15, 15],
    });
  }, []);

  const updateMarkers = useCallback(
    async (branches: Branch[]) => {
      if (!mapInstanceRef.current || !isMapLoaded) return;

      const { map, markers, popup } = mapInstanceRef.current;
      const L = await import("leaflet");

      const currentIds = new Set(branches.map((b) => b.id.toString()));
      for (const [id, marker] of markers.entries()) {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          markers.delete(id);
        }
      }

      branches.forEach((branch) => {
        const id = branch.id.toString();
        let marker = markers.get(id);

        if (!marker) {
          marker = L.marker([branch.lat, branch.lng], {
            icon: createFoxIcon(L),
          });

          marker.on("click", () => {
            const content = `
            <div style="min-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${
                branch.name
              }</h3>
              <div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">
                <strong>📍</strong> ${branch.address}
              </div>
              <div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">
                <strong>📞</strong> ${branch.phone}
              </div>
              <div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">
                <strong>🕒</strong> ${branch.hours}
              </div>
            
              <div style="margin-bottom: 12px;">
                ${branch.services
                  .map(
                    (service) =>
                      `<span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 8px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; display: inline-block;">${service}</span>`
                  )
                  .join("")}
              </div>
              <button onclick="window.openBooking(${branch.id})" style="
                width: 100%; 
                background:rgb(232, 77, 16); 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
              ">
                📅 Đặt lịch hẹn
              </button>
            </div>
          `;
            popup
              ?.setLatLng([branch.lat, branch.lng])
              .setContent(content)
              .openOn(map);
          });

          markers.set(id, marker);
        }

        marker.addTo(map);
      });

      console.log("[v0] Updated markers:", branches.length);
    },
    [isMapLoaded, createFoxIcon]
  );

  const fitBoundsToMarkers = useCallback(
    async (branches: Branch[], force = false) => {
      if (!mapInstanceRef.current || !isMapLoaded || branches.length === 0)
        return;
      if (userInteracted && !force) return;

      const { map } = mapInstanceRef.current;
      const L = await import("leaflet");

      const group = L.featureGroup(
        branches.map((branch) =>
          L.marker([branch.lat, branch.lng], {
            icon: createFoxIcon(L),
          })
        )
      );

      map.fitBounds(group.getBounds(), {
        padding: [50, 50],
        maxZoom: 15,
      });

      console.log("[v0] Fitted bounds to", branches.length, "branches");
    },
    [isMapLoaded, userInteracted, createFoxIcon]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let filtered = branches;

      if (searchTerm) {
        filtered = filtered.filter(
          (branch) =>
            branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            branch.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedCity !== "Tất cả") {
        filtered = filtered.filter((branch) => branch.city === selectedCity);
      }

      if (selectedServices.length > 0) {
        filtered = filtered.filter((branch) =>
          selectedServices.some((service) => branch.services.includes(service))
        );
      }

      setFilteredBranches(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCity, selectedBranchType, selectedServices]);

  useEffect(() => {
    updateMarkers(filteredBranches);
    fitBoundsToMarkers(filteredBranches);
  }, [filteredBranches, updateMarkers, fitBoundsToMarkers]);

  // Trigger map resize when sidebar visibility changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.map.invalidateSize();
      }, 300); // Wait for sidebar transition to complete
    }
  }, [showSidebar]);

  useEffect(() => {
    const currentMapRef = mapRef.current;
    initializeMap();
    (
      window as unknown as { openBooking: (branchId: number) => void }
    ).openBooking = (branchId: number) => {
      const branch = branches.find((b) => b.id === branchId);
      if (branch) {
        setSelectedBranch(branch);
        setShowBookingForm(true);
      }
    };

    // Add resize listener
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.map.remove();
          // Clear the leaflet_id to allow re-initialization
          if (currentMapRef) {
            delete (currentMapRef as HTMLElement & { _leaflet_id?: number })
              ._leaflet_id;
          }
        } catch (error) {
          console.log("[v0] Error removing map:", error);
        } finally {
          mapInstanceRef.current = null;
        }
      }
    };
  }, [initializeMap]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const resetView = () => {
    setUserInteracted(false);
    fitBoundsToMarkers(filteredBranches, true);
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          if (mapInstanceRef.current) {
            const { map } = mapInstanceRef.current;
            const L = await import("leaflet");

            map.setView([latitude, longitude], 15);

            L.marker([latitude, longitude], {
              icon: L.divIcon({
                html: `
                  <div style="
                    width: 20px; 
                    height: 20px; 
                    background: #3b82f6; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  "></div>
                `,
                className: "user-location-marker",
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              }),
            }).addTo(map);

            L.circle([latitude, longitude], {
              radius: position.coords.accuracy,
              fillColor: "#3b82f6",
              fillOpacity: 0.1,
              color: "#3b82f6",
              weight: 1,
            }).addTo(map);
          }
        } catch (error) {
          console.error("[v0] Error setting location:", error);
          alert("Có lỗi xảy ra khi hiển thị vị trí");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("[v0] Geolocation error:", error);
        let message = "Không thể lấy vị trí của bạn";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Bạn đã từ chối quyền truy cập vị trí";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Thông tin vị trí không khả dụng";
            break;
          case error.TIMEOUT:
            message = "Yêu cầu vị trí hết thời gian chờ";
            break;
        }
        alert(message);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const groupedBranches = filteredBranches.reduce((acc, branch) => {
    if (!acc[branch.city]) {
      acc[branch.city] = [];
    }
    acc[branch.city].push(branch);
    return acc;
  }, {} as Record<string, Branch[]>);

  const handleBranchClick = async (branch: Branch) => {
    if (!mapInstanceRef.current) return;

    const { map, popup } = mapInstanceRef.current;

    map.setView([branch.lat, branch.lng], 16);

    const content = `
      <div style="min-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${
          branch.name
        }</h3>
        <div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">
          <strong>📍</strong> ${branch.address}
        </div>
        <div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">
          <strong>📞</strong> ${branch.phone}
        </div>
        <div style="margin-bottom: 6px; color: #6b7280; font-size: 14px;">
          <strong>🕒</strong> ${branch.hours}
        </div>
       
        <div style="margin-bottom: 12px;">
          ${branch.services
            .map(
              (service) =>
                `<span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 8px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; display: inline-block;">${service}</span>`
            )
            .join("")}
        </div>
        <button onclick="window.openBooking(${branch.id})" style="
          width: 100%; 
          background: #f97316; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">
          📅 Đặt lịch hẹn
        </button>
      </div>
    `;
    popup?.setLatLng([branch.lat, branch.lng]).setContent(content).openOn(map);
  };

  return (
    <div className="relative h-full w-full bg-gray-900 flex !p-0 !m-0 overflow-hidden">
      <div
        className={`${
          showSidebar ? "w-96" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-300 flex flex-col z-[1001] flex-shrink-0 shadow-xl`}
      >
        <div
          className="p-4 text-white relative"
          style={{
            background: "linear-gradient(to right, #f97316, #dc2626)",
            backgroundColor: "#f97316", // fallback
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-orange-600"
                style={{ backgroundColor: "white" }}
              >
                <Image src="/logo.png" alt="Fox Logo" width={32} height={32} />
              </div>
              <h1 className="text-lg font-bold" style={{ color: "#ffffff" }}>
                Face Wash Fox
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(false)}
              className="text-white hover:bg-white/20 border-white/20"
              style={{ color: "#ffffff" }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Bản đồ tất cả chi nhánh của nhà Cáo
          </p>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm chi nhánh..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4 border-b">
          <label className="text-sm font-medium mb-2 block">
            Lọc theo thành phố:
          </label>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCity(city)}
                className={
                  selectedCity === city ? "bg-red-500 hover:bg-red-600" : ""
                }
              >
                {city}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedBranches).map(([city, cityBranches]) => (
            <div key={city} className="border-b">
              <div className="p-4 bg-gray-50 flex items-center gap-2">
                
                <h3 className="font-semibold text-gray-800">
                  {city} - {cityBranches.length} Chi Nhánh
                </h3>
              </div>

              {cityBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleBranchClick(branch)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Image
                        src="/logo.png"
                        alt="Fox Logo"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {branch.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {branch.address}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <Phone className="h-3 w-3" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSelectedBranch(branch);
                            setShowBookingForm(true);
                          }}
                          className="text-xs"
                        >
                          Đặt lịch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative min-w-0 overflow-hidden">
        {!showSidebar && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 left-4 z-[1000] bg-white shadow-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div
          className={`absolute top-4 ${
            showSidebar ? "left-4" : "left-16"
          } right-4 z-[1000] flex gap-2`}
        ></div>

        {showFilters && (
          <Card
            className={`absolute top-16 ${
              showSidebar ? "left-4" : "left-16"
            } right-4 z-[1000] max-w-md shadow-lg`}
          >
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Loại chi nhánh
                </label>
                <select
                  value={selectedBranchType}
                  onChange={(e) => setSelectedBranchType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {branchTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Dịch vụ
                </label>
                <div className="space-y-2">
                  {serviceTypes.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={service}
                        checked={selectedServices.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={service} className="text-sm">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedBranchType("Tất cả");
                  setSelectedServices([]);
                }}
                className="w-full"
              >
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}

        <div
          ref={mapRef}
          className="absolute inset-0 w-full h-full z-0"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "100%",
          }}
        />

        {/* Branch count display */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">
              Hiển thị {filteredBranches.length} / {branches.length} chi nhánh
            </span>
          </div>
          {selectedCity !== "Tất cả" && (
            <div className="text-xs opacity-90 mt-2 bg-white/20 px-2 py-1 rounded-md">
              📍 Đang lọc theo: {selectedCity}
            </div>
          )}
          {searchTerm && (
            <div className="text-xs opacity-90 mt-2 bg-white/20 px-2 py-1 rounded-md">
              🔍 Tìm kiếm: &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>

        <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={getMyLocation}
            disabled={isLoadingLocation}
            className="bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl disabled:opacity-50 border-white/30 hover:scale-105 transition-all duration-200"
            title={isLoadingLocation ? "Đang tải vị trí..." : "Vị trí của tôi"}
          >
            {isLoadingLocation ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <Navigation className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetView}
            className="bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl border-white/30 hover:scale-105 transition-all duration-200"
            title="Reset view"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {!isMapLoaded && !mapError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-[1001]">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500/30 border-t-orange-500 mx-auto mb-4"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-orange-500/20"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">
                Đang tải bản đồ...
              </div>
              <div className="text-sm text-gray-300">
                Vui lòng chờ trong giây lát
              </div>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center z-[1001]">
            <div className="text-center">
              <div className="relative">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <div className="absolute inset-0 animate-pulse text-red-300 text-6xl">
                  ⚠️
                </div>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                Lỗi tải bản đồ
              </div>
              <div className="text-sm text-red-200 mb-6 max-w-md">
                {mapError}
              </div>
              <Button
                onClick={() => {
                  setMapError(null);
                  setIsMapLoaded(false);
                  mapInstanceRef.current = null;
                  initializeMap();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                🔄 Thử lại
              </Button>
            </div>
          </div>
        )}
      </div>

      {showBranchDetails && selectedBranch && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setShowBranchDetails(false)}
        >
          <div className="fixed inset-0 bg-black/80" />
          <div
            className="fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle>{selectedBranch.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>{selectedBranch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBranch.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBranch.hours}</span>
                </div>
                <div className="flex items-center gap-2"></div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedBranch.services.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowBranchDetails(false);
                  setShowBookingForm(true);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Đặt lịch hẹn
              </Button>
            </div>
            <button
              onClick={() => setShowBranchDetails(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Dialog */}
      {selectedBranch && showBookingForm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setShowBookingForm(false)}
        >
          <div className="fixed inset-0 bg-black/80" />
          <div
            className="fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Đặt lịch hẹn
              </DialogTitle>
              <div className="text-sm text-gray-600">
                Chi nhánh:{" "}
                <span className="font-medium">{selectedBranch.name}</span>
              </div>
            </DialogHeader>
            <BookingForm
              branch={selectedBranch}
              onClose={() => setShowBookingForm(false)}
            />
            <button
              onClick={() => setShowBookingForm(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm({
  branch,
  onClose,
}: {
  branch: Branch;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ];

  const numberCustomer = [
    "1",
    "2",
    "3",
    "4",
    "5"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gửi email xác nhận đặt lịch
      const emailResponse = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerEmail: customerEmail || 'chưa-cung-cấp@example.com',
          customerPhone,
          service: selectedService || 'Dịch vụ chăm sóc da',
          branchName: branch.name,
          branchAddress: branch.address || 'Chưa cung cấp',
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          bookingCustomer: setSelectedCustomer
        }),
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        // const customerSuccess = emailResult.emailDetails?.customer?.success;
        // const businessSuccess = emailResult.emailDetails?.business?.success;
        
        // Email status logic removed as it's not used

        alert(
          `🎉 Xác nhận lịch thành công!\nNhà Cáo sẽ liên hệ để hỗ trợ khách iu trong thời gian sớm nhất!!! `
        );
      } else {
        alert(
          `✅ Đặt lịch thành công!\n\n⚠️ Không thể gửi email xác nhận: ${emailResult.error}\n`
        );
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      alert(
        `✅ Đặt lịch thành công!\n\n⚠️ Lỗi gửi email: ${error instanceof Error ? error.message : 'Unknown error'}\n`
      );
    }

    setIsSubmitting(false);

    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setSelectedCustomer("");
    setSelectedService("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");

    // Close dialog
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Họ và tên</label>
        <Input
          value={customerName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCustomerName(e.target.value)
          }
          placeholder="Nhập họ và tên"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Số điện thoại</label>
        <Input
          value={customerPhone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCustomerPhone(e.target.value)
          }
          placeholder="Nhập số điện thoại"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Email (tùy chọn)</label>
        <Input
          type="email"
          value={customerEmail}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCustomerEmail(e.target.value)
          }
          placeholder="Nhập email để nhận xác nhận"
        />
        <p className="text-xs text-gray-500 mt-1">
          📧 Email xác nhận sẽ được gửi đến địa chỉ này
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Ngày hẹn</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedDate(e.target.value)
          }
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Giờ hẹn</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn giờ</option>
          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Số khách</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn số lượng</option>
          {numberCustomer.map((customer) => (
            <option key={customer} value={customer}>
              {customer}
            </option>
          ))}
        </select>
      </div>

    

      <Button
        type="submit"
        className="w-full bg-orange-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
      </Button>
    </form>
  );
}
