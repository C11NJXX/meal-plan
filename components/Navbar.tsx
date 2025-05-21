import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav>
      <div>
        <Link href={"/"}>
          <Image alt="Logo" src={"/logo.png"} width={60} height={60} />
        </Link>
      </div>
      <div>{/* TODO:后期根据是否登陆渲染不同的链接 */}</div>
    </nav>
  );
};

export default Navbar;
